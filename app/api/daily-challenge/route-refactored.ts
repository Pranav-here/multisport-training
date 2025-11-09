import { NextResponse } from "next/server";
import { z } from "zod";
import { redis } from "@/lib/cache/redis";
import { logger, logRequest } from "@/lib/log";
import { withBreaker } from "@/lib/http/withBreaker";
import { challengeSchema } from "@/lib/validation/schemas";
import { createServerClient } from "@/lib/supabase-server";
import {
  formatLocalDate,
  normalizeDifficulty,
  seededRandom,
  selectThumbnail,
  computeDeadlineIso,
  fallbackSports,
} from "@/lib/daily-challenge";

/**
 * Refactored daily challenge API with:
 * - Redis caching per user/date
 * - Circuit breaker for Groq API
 * - Structured logging
 * - Proper error handling
 */

const CACHE_TTL = 60 * 60 * 6; // 6 hours

const groqChallengeSchema = z.object({
  title: z.string().min(6),
  description: z.string().min(16),
  sport: z.string().min(2),
  difficulty: z.enum(["easy", "medium", "hard"]).catch("medium"),
  points: z.number().int().min(10).max(500).catch(75),
  instructions: z.array(z.string().min(6)).min(2).max(6),
});

type SupabaseSportRow = {
  sport_id: number;
  sports: {
    slug: string;
    name: string;
  } | null;
};

function extractJsonBlock(content: string): unknown {
  if (!content) return null;

  const sanitized = content.replace(/```json|```/gi, "").trim();
  const match = sanitized.match(/\{[\s\S]*\}/);
  if (!match) {
    return null;
  }

  try {
    return JSON.parse(match[0]);
  } catch (error) {
    logger.warn({ error }, "Failed to parse JSON from Groq response");
    return null;
  }
}

async function callGroq(payload: {
  sports: Array<{ slug: string; name: string }>;
  localDate: string;
  timeZone: string;
  seed: string;
}): Promise<z.infer<typeof groqChallengeSchema> | null> {
  const startTime = Date.now();
  const groqKey = process.env.GROQ_API_KEY;

  if (!groqKey) {
    throw new Error("Groq API key not configured");
  }

  const sportList = payload.sports;
  const sportsSummary = sportList.map((sport) => `${sport.name} (slug: "${sport.slug}")`).join(", ");

  const systemPrompt =
    "You are a multi-sport performance coach creating one daily training challenge for competitive teen athletes.";

  const userPrompt = [
    `Today is ${payload.localDate} for the athlete in time zone ${payload.timeZone}.`,
    "Choose exactly one sport from this list and create a fresh, practical challenge that can be done with minimal equipment.",
    `Available sports: ${sportsSummary}.`,
    "Respond with strict JSON (no markdown) using this structure:",
    `{"title": "...","description": "...","sport": "<use the provided sport slug exactly>","difficulty": "easy|medium|hard","points": <integer between 40 and 120>,"instructions": ["Step 1", "Step 2", "Step 3"]}`,
    "Keep instructions actionable (12-18 words), focus on skill quality, and make the challenge completable within 30-45 minutes.",
    `Make the output deterministic for seed ${payload.seed}.`,
  ].join(" ");

  try {
    // Use circuit breaker with 10s timeout for AI generation
    const result = await withBreaker(
      "groq-daily-challenge",
      async () => {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${groqKey}`,
          },
          body: JSON.stringify({
            model: process.env.GROQ_DAILY_CHALLENGE_MODEL ?? "llama-3.3-70b-versatile",
            temperature: 0.6,
            max_tokens: 500,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt },
            ],
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Groq request failed: ${errorText}`);
        }

        return response.json();
      },
      { timeout: 10000 } // 10 second timeout for AI generation
    );

    const duration = Date.now() - startTime;

    if (!result.ok) {
      logger.error({ error: result.error.message, duration }, "Groq API call failed");
      return null;
    }

    const data = result.value as {
      choices?: Array<{ message?: { content?: string } }>;
    };

    const content = data.choices?.[0]?.message?.content;
    const parsed = extractJsonBlock(content ?? "");
    if (!parsed) {
      logger.warn({ content, duration }, "Failed to extract JSON from Groq response");
      return null;
    }

    const validated = groqChallengeSchema.safeParse(parsed);
    if (!validated.success) {
      logger.warn({ issues: validated.error.issues, parsed, duration }, "Groq response validation failed");
      return null;
    }

    logger.info({ sport: validated.data.sport, duration }, "Generated daily challenge via Groq");

    return validated.data;
  } catch (error) {
    logger.error(
      { error: error instanceof Error ? error.message : String(error), duration: Date.now() - startTime },
      "Unexpected error calling Groq"
    );
    return null;
  }
}

export async function GET(request: Request) {
  const requestId = crypto.randomUUID();
  const startTime = Date.now();

  try {
    const supabase = await createServerClient();
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      logger.error({ error: sessionError.message, requestId }, "Failed to read session");
      logRequest({
        method: "GET",
        url: "/api/daily-challenge",
        statusCode: 500,
        duration: Date.now() - startTime,
        requestId,
      });
      return NextResponse.json({ error: "Unable to verify session" }, { status: 500 });
    }

    if (!session) {
      logRequest({
        method: "GET",
        url: "/api/daily-challenge",
        statusCode: 401,
        duration: Date.now() - startTime,
        requestId,
      });
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { searchParams } = new URL(request.url);
    const timeZone = searchParams.get("tz") ?? Intl.DateTimeFormat().resolvedOptions().timeZone ?? "UTC";

    let localDate: string;
    try {
      localDate = formatLocalDate(new Date(), timeZone);
    } catch (error) {
      logger.warn({ error, timeZone, requestId }, "Invalid timezone, falling back to UTC");
      localDate = formatLocalDate(new Date(), "UTC");
    }

    // Check cache first
    const cacheKey = `daily:challenge:${userId}:${localDate}`;
    const cached = await redis.get(cacheKey);

    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        logger.info({ userId, localDate, requestId, cached: true }, "Served cached daily challenge");
        logRequest({
          method: "GET",
          url: "/api/daily-challenge",
          statusCode: 200,
          duration: Date.now() - startTime,
          userId,
          requestId,
        });
        return NextResponse.json(parsed, {
          headers: { "X-Cache": "HIT", "X-Request-ID": requestId },
        });
      } catch (error) {
        logger.warn({ error, requestId }, "Failed to parse cached challenge, regenerating");
        await redis.del(cacheKey);
      }
    }

    // Fetch user sports
    const { data: sportsRows, error: sportsError } = await supabase
      .from("user_sports")
      .select("sport_id, sports (slug, name)")
      .eq("user_id", userId);

    if (sportsError) {
      logger.error({ error: sportsError.message, userId, requestId }, "Failed to load user sports");
      logRequest({
        method: "GET",
        url: "/api/daily-challenge",
        statusCode: 500,
        duration: Date.now() - startTime,
        userId,
        requestId,
      });
      return NextResponse.json(
        { error: "Unable to load your sports preferences. Please try again or update your profile." },
        { status: 500 }
      );
    }

    const sportsFromDb = ((sportsRows ?? []) as SupabaseSportRow[])
      .filter((row): row is SupabaseSportRow & { sports: { slug: string; name: string } } => Boolean(row.sports))
      .map((row) => ({
        slug: row.sports.slug,
        name: row.sports.name,
        id: row.sport_id,
      }));

    const sports: Array<{ slug: string; name: string; id?: number }> =
      sportsFromDb.length > 0 ? sportsFromDb : fallbackSports;

    const usingSportsFallback = sportsFromDb.length === 0;
    if (usingSportsFallback) {
      logger.warn({ userId, requestId }, "User has no sports configured, using fallback sports");
    }

    const seed = `${userId}-${localDate}`;

    if (!process.env.GROQ_API_KEY) {
      logger.error({ requestId }, "GROQ_API_KEY not configured");
      logRequest({
        method: "GET",
        url: "/api/daily-challenge",
        statusCode: 503,
        duration: Date.now() - startTime,
        userId,
        requestId,
      });
      return NextResponse.json(
        { error: "Challenge generation service not configured. Please contact support." },
        { status: 503 }
      );
    }

    const generatedChallenge = await callGroq({ sports, localDate, timeZone, seed });

    if (!generatedChallenge) {
      logger.error({ userId, localDate, requestId }, "Failed to generate challenge");
      logRequest({
        method: "GET",
        url: "/api/daily-challenge",
        statusCode: 500,
        duration: Date.now() - startTime,
        userId,
        requestId,
      });
      return NextResponse.json(
        { error: "Failed to generate a valid challenge. Please try again." },
        { status: 500 }
      );
    }

    let sportSlug = generatedChallenge.sport;
    if (!sports.some((sport) => sport.slug === sportSlug)) {
      logger.warn({ generatedSport: sportSlug, availableSports: sports.map((s) => s.slug), requestId }, "Generated sport not in user sports");
      sportSlug = sports[0].slug;
    }

    const difficulty = normalizeDifficulty(generatedChallenge.difficulty);
    const points = Math.max(40, Math.min(150, generatedChallenge.points));
    const participants = Math.round(500 + seededRandom(`${seed}-${sportSlug}-participants`) * 4500);
    const resolvedSportsMap = new Map(sports.map((sport) => [sport.slug, sport.name]));
    const sportName = resolvedSportsMap.get(sportSlug) ?? sportSlug;
    const thumbnail = selectThumbnail(sportSlug);

    let deadlineIso: string;
    try {
      deadlineIso = computeDeadlineIso(localDate, timeZone);
    } catch (error) {
      logger.warn({ error, timeZone, requestId }, "Failed to compute deadline, falling back to UTC");
      deadlineIso = computeDeadlineIso(localDate, "UTC");
    }

    const challenge = {
      id: `daily-${localDate.replace(/-/g, "")}-${sportSlug}`,
      title: generatedChallenge.title,
      description: generatedChallenge.description,
      sport: sportName,
      sportSlug,
      difficulty,
      points,
      participants,
      thumbnail,
      instructions: generatedChallenge.instructions,
      challengeDate: localDate,
      timeZone,
      generatedAt: new Date().toISOString(),
      deadline: deadlineIso,
    };

    const response = {
      challenge,
      metadata: {
        usingSportsFallback,
        generatedByAI: true,
      },
    };

    // Cache the response
    await redis.set(cacheKey, JSON.stringify(response), { ex: CACHE_TTL });

    logger.info({ userId, localDate, sport: sportSlug, requestId, cached: false }, "Generated and cached daily challenge");

    logRequest({
      method: "GET",
      url: "/api/daily-challenge",
      statusCode: 200,
      duration: Date.now() - startTime,
      userId,
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
      "Unexpected error in daily challenge API"
    );

    logRequest({
      method: "GET",
      url: "/api/daily-challenge",
      statusCode: 500,
      duration: Date.now() - startTime,
      requestId,
      error: error instanceof Error ? error : new Error(String(error)),
    });

    return NextResponse.json({ error: "An unexpected error occurred. Please try again." }, { status: 500 });
  }
}
