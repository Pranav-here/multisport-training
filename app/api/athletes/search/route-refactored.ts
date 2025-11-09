import { NextRequest, NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { redis } from "@/lib/cache/redis";
import { logger, logRequest, logExternalAPI } from "@/lib/log";
import { withBreaker } from "@/lib/http/withBreaker";
import {
  athleteSearchResponseSchema,
  normalizedAthleteSchema,
  type NormalizedAthlete,
} from "@/lib/validation/schemas";

/**
 * Refactored athlete search API with:
 * - Per-IP rate limiting (30 requests per minute)
 * - Redis caching (5 minute TTL)
 * - Zod validation for external API responses
 * - Circuit breaker with timeout
 * - Structured logging
 */

const CACHE_TTL = 60 * 5; // 5 minutes
const RATE_LIMIT_WINDOW = "1 m";
const RATE_LIMIT_MAX = 30;

// Initialize rate limiter
// Falls back gracefully if Redis is not configured
let ratelimit: Ratelimit | null = null;

try {
  ratelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(RATE_LIMIT_MAX, RATE_LIMIT_WINDOW),
    analytics: true,
    prefix: "ratelimit:athlete-search",
  });
} catch (error) {
  logger.warn({ error }, "Failed to initialize rate limiter, continuing without rate limiting");
}

export async function GET(request: NextRequest) {
  const requestId = crypto.randomUUID();
  const startTime = Date.now();

  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q")?.trim();

    if (!query) {
      logRequest({
        method: "GET",
        url: "/api/athletes/search",
        statusCode: 400,
        duration: Date.now() - startTime,
        requestId,
      });
      return NextResponse.json({ error: "Missing query parameter" }, { status: 400 });
    }

    if (query.length < 2) {
      logRequest({
        method: "GET",
        url: "/api/athletes/search",
        statusCode: 400,
        duration: Date.now() - startTime,
        requestId,
      });
      return NextResponse.json({ error: "Query must be at least 2 characters" }, { status: 400 });
    }

    // Rate limiting
    if (ratelimit) {
      const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
                 request.headers.get("x-real-ip") ??
                 "unknown";

      const { success, limit, remaining, reset } = await ratelimit.limit(`search:${ip}`);

      if (!success) {
        logger.warn(
          { ip, query, limit, remaining, reset, requestId },
          "Rate limit exceeded for athlete search"
        );

        logRequest({
          method: "GET",
          url: "/api/athletes/search",
          statusCode: 429,
          duration: Date.now() - startTime,
          requestId,
        });

        return NextResponse.json(
          { error: "Too many requests. Please slow down." },
          {
            status: 429,
            headers: {
              "X-RateLimit-Limit": limit.toString(),
              "X-RateLimit-Remaining": remaining.toString(),
              "X-RateLimit-Reset": reset.toString(),
              "X-Request-ID": requestId,
            },
          }
        );
      }

      logger.debug({ ip, query, remaining, requestId }, "Rate limit check passed");
    }

    // Check cache
    const cacheKey = `athlete:search:${query.toLowerCase()}`;
    const cached = await redis.get(cacheKey);

    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        logger.info({ query, requestId, cached: true }, "Served cached athlete search results");

        logRequest({
          method: "GET",
          url: "/api/athletes/search",
          statusCode: 200,
          duration: Date.now() - startTime,
          requestId,
        });

        return NextResponse.json(parsed, {
          headers: { "X-Cache": "HIT", "X-Request-ID": requestId },
        });
      } catch (error) {
        logger.warn({ error, requestId }, "Failed to parse cached athlete search, refetching");
        await redis.del(cacheKey);
      }
    }

    // Fetch from TheSportsDB with circuit breaker and timeout
    const apiKey = process.env.SPORTSDB_API?.replace(/"/g, "") || "3";
    const url = `https://www.thesportsdb.com/api/v1/json/${apiKey}/searchplayers.php?p=${encodeURIComponent(query)}`;

    const apiStartTime = Date.now();
    const result = await withBreaker(
      "sportsdb-search",
      async () => {
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`TheSportsDB API returned ${response.status}`);
        }

        return response.json();
      },
      { timeout: 5000 } // 5 second timeout
    );

    const apiDuration = Date.now() - apiStartTime;

    if (!result.ok) {
      logger.error({ error: result.error.message, query, requestId, duration: apiDuration }, "TheSportsDB API call failed");

      logExternalAPI({
        service: "TheSportsDB",
        endpoint: "/searchplayers.php",
        method: "GET",
        duration: apiDuration,
        error: result.error,
      });

      logRequest({
        method: "GET",
        url: "/api/athletes/search",
        statusCode: 502,
        duration: Date.now() - startTime,
        requestId,
      });

      return NextResponse.json(
        { error: "Athlete search service temporarily unavailable" },
        { status: 502, headers: { "X-Request-ID": requestId } }
      );
    }

    // Validate response with Zod
    const validationResult = athleteSearchResponseSchema.safeParse(result.value);

    if (!validationResult.success) {
      logger.error(
        { error: validationResult.error.issues, query, requestId },
        "TheSportsDB response validation failed"
      );

      logExternalAPI({
        service: "TheSportsDB",
        endpoint: "/searchplayers.php",
        method: "GET",
        statusCode: 200,
        duration: apiDuration,
      });

      // Return empty results on validation failure
      const emptyResponse = { results: [] };
      await redis.set(cacheKey, JSON.stringify(emptyResponse), { ex: CACHE_TTL });

      logRequest({
        method: "GET",
        url: "/api/athletes/search",
        statusCode: 200,
        duration: Date.now() - startTime,
        requestId,
      });

      return NextResponse.json(emptyResponse, {
        headers: { "X-Cache": "MISS", "X-Request-ID": requestId },
      });
    }

    logExternalAPI({
      service: "TheSportsDB",
      endpoint: "/searchplayers.php",
      method: "GET",
      statusCode: 200,
      duration: apiDuration,
    });

    const data = validationResult.data;

    if (!data.player || data.player.length === 0) {
      const emptyResponse = { results: [] };
      await redis.set(cacheKey, JSON.stringify(emptyResponse), { ex: CACHE_TTL });

      logger.info({ query, requestId }, "No athletes found");

      logRequest({
        method: "GET",
        url: "/api/athletes/search",
        statusCode: 200,
        duration: Date.now() - startTime,
        requestId,
      });

      return NextResponse.json(emptyResponse, {
        headers: { "X-Cache": "MISS", "X-Request-ID": requestId },
      });
    }

    // Transform and normalize data
    const results: NormalizedAthlete[] = data.player.slice(0, 10).map((player) => ({
      id: player.idPlayer,
      name: player.strPlayer,
      team: player.strTeam ?? "Free Agent",
      nationality: player.strNationality ?? undefined,
      sport: player.strSport ?? undefined,
      position: player.strPosition ?? undefined,
      imageUrl: player.strThumb ?? undefined,
    }));

    // Validate normalized data
    const validatedResults = results.filter((result) => normalizedAthleteSchema.safeParse(result).success);

    if (validatedResults.length !== results.length) {
      logger.warn(
        { original: results.length, validated: validatedResults.length, query, requestId },
        "Some athlete results failed normalization"
      );
    }

    const response = { results: validatedResults };

    // Cache the response
    await redis.set(cacheKey, JSON.stringify(response), { ex: CACHE_TTL });

    logger.info(
      { query, resultsCount: validatedResults.length, requestId, cached: false },
      "Fetched and cached athlete search results"
    );

    logRequest({
      method: "GET",
      url: "/api/athletes/search",
      statusCode: 200,
      duration: Date.now() - startTime,
      requestId,
    });

    return NextResponse.json(response, {
      headers: { "X-Cache": "MISS", "X-Request-ID": requestId },
    });
  } catch (error) {
    logger.error(
      {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        requestId,
        duration: Date.now() - startTime,
      },
      "Unexpected error in athlete search API"
    );

    logRequest({
      method: "GET",
      url: "/api/athletes/search",
      statusCode: 500,
      duration: Date.now() - startTime,
      requestId,
      error: error instanceof Error ? error : new Error(String(error)),
    });

    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500, headers: { "X-Request-ID": requestId } }
    );
  }
}
