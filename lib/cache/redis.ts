import { Redis } from "@upstash/redis";

/**
 * Redis client with fallback to in-memory storage for development
 * In production, ensure UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are set
 */

const UPSTASH_REDIS_REST_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_REDIS_REST_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

// In-memory fallback for development when Upstash is not configured
class InMemoryRedis {
  private store: Map<string, { value: string; expiresAt?: number }> = new Map();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Clean up expired entries every 60 seconds
    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of this.store.entries()) {
        if (entry.expiresAt && entry.expiresAt < now) {
          this.store.delete(key);
        }
      }
    }, 60_000);
  }

  async get(key: string): Promise<string | null> {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (entry.expiresAt && entry.expiresAt < Date.now()) {
      this.store.delete(key);
      return null;
    }
    return entry.value;
  }

  async set(
    key: string,
    value: string,
    options?: { ex?: number; px?: number }
  ): Promise<"OK"> {
    let expiresAt: number | undefined;
    if (options?.ex) {
      expiresAt = Date.now() + options.ex * 1000;
    } else if (options?.px) {
      expiresAt = Date.now() + options.px;
    }
    this.store.set(key, { value, expiresAt });
    return "OK";
  }

  async del(...keys: string[]): Promise<number> {
    let count = 0;
    for (const key of keys) {
      if (this.store.delete(key)) count++;
    }
    return count;
  }

  async incr(key: string): Promise<number> {
    const current = await this.get(key);
    const newValue = (parseInt(current || "0", 10) || 0) + 1;
    await this.set(key, newValue.toString());
    return newValue;
  }

  async decr(key: string): Promise<number> {
    const current = await this.get(key);
    const newValue = (parseInt(current || "0", 10) || 0) - 1;
    await this.set(key, newValue.toString());
    return newValue;
  }

  async expire(key: string, seconds: number): Promise<number> {
    const entry = this.store.get(key);
    if (!entry) return 0;
    entry.expiresAt = Date.now() + seconds * 1000;
    this.store.set(key, entry);
    return 1;
  }

  cleanup() {
    clearInterval(this.cleanupInterval);
    this.store.clear();
  }
}

// Create the appropriate Redis client based on environment
export const redis =
  UPSTASH_REDIS_REST_URL && UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: UPSTASH_REDIS_REST_URL,
        token: UPSTASH_REDIS_REST_TOKEN,
      })
    : (new InMemoryRedis() as unknown as Redis);

// Export flag to check which implementation is being used
export const isUsingInMemory = !UPSTASH_REDIS_REST_URL || !UPSTASH_REDIS_REST_TOKEN;

if (isUsingInMemory && process.env.NODE_ENV === "production") {
  console.warn(
    "⚠️  WARNING: Using in-memory Redis fallback in production. Configure Upstash Redis for better performance and persistence."
  );
} else if (isUsingInMemory) {
  console.log("ℹ️  Using in-memory Redis fallback for development");
}
