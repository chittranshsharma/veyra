import "server-only";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";

const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;

// Initialize Redis client if Upstash credentials are provided
const redis = url && token ? new Redis({ url, token }) : null;

// Upstash sliding window rate limiters
export const apiRateLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(20, "10 s"),
      analytics: true,
      prefix: "@veyra/ratelimit/api",
    })
  : null;

export const authRateLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "60 s"),
      analytics: true,
      prefix: "@veyra/ratelimit/auth",
    })
  : null;

// In-memory fallback map for local development when Upstash credentials are not yet set
const memoryStore = new Map<string, { count: number; reset: number }>();

function memoryLimit(
  key: string,
  limit: number,
  windowMs: number
): { success: boolean; limit: number; remaining: number; reset: number } {
  const now = Date.now();
  const record = memoryStore.get(key);

  if (!record || now > record.reset) {
    memoryStore.set(key, { count: 1, reset: now + windowMs });
    return { success: true, limit, remaining: limit - 1, reset: now + windowMs };
  }

  if (record.count >= limit) {
    return { success: false, limit, remaining: 0, reset: record.reset };
  }

  record.count += 1;
  return {
    success: true,
    limit,
    remaining: limit - record.count,
    reset: record.reset,
  };
}

export async function checkRateLimit(
  identifier: string,
  type: "api" | "auth"
): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> {
  try {
    if (type === "api") {
      if (apiRateLimiter) {
        const res = await apiRateLimiter.limit(identifier);
        return {
          success: res.success,
          limit: res.limit,
          remaining: res.remaining,
          reset: res.reset,
        };
      }
      return memoryLimit(`api:${identifier}`, 20, 10_000);
    } else {
      if (authRateLimiter) {
        const res = await authRateLimiter.limit(identifier);
        return {
          success: res.success,
          limit: res.limit,
          remaining: res.remaining,
          reset: res.reset,
        };
      }
      return memoryLimit(`auth:${identifier}`, 5, 60_000);
    }
  } catch (err) {
    console.error("[RateLimit] Error executing rate limit check:", err);
    // Fail-open for external network failure so users aren't locked out if Redis is unreachable
    return { success: true, limit: 100, remaining: 100, reset: Date.now() + 1000 };
  }
}

export function rateLimitResponse(reset: number) {
  const retryAfterSec = Math.max(1, Math.ceil((reset - Date.now()) / 1000));
  return NextResponse.json(
    {
      error: "Too many requests. Please slow down and try again later.",
      retryAfter: retryAfterSec,
    },
    {
      status: 429,
      headers: {
        "Retry-After": String(retryAfterSec),
        "X-RateLimit-Reset": String(reset),
        "Content-Type": "application/json",
      },
    }
  );
}
