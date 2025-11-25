// lib/rate-limit.ts
import { redisHttp } from "./lib/redis-http";

type Window = {
  count: number;
  resetAt: number;
};

const memoryStore = new Map<string, Window>();

const MAX = Number(process.env.RATE_LIMIT_MAX ?? 3);
const WINDOW = Number(process.env.RATE_LIMIT_WINDOW ?? 3600); 

export async function checkRateLimit(key: string) {
  if (redisHttp) {
    try {
      const redisKey = `rl:${key}`;
      const [count, ttl] = await redisHttp
        .multi()
        .incr(redisKey)
        .ttl(redisKey)
        .exec<[number, number]>();

      if (ttl === -1) {
        await redisHttp.expire(redisKey, WINDOW);
      }

      const remaining = Math.max(0, MAX - count);
      const resetIn = ttl > 0 ? ttl : WINDOW;

      return {
        ok: count <= MAX,
        count,
        remaining,
        resetIn,
      };
    } catch (err: any) {
      console.error("[rate-limit] Upstash HTTP error:", err.message);
    }
  }
  const now = Date.now();
  const entry = memoryStore.get(key);

  if (!entry) {
    memoryStore.set(key, { count: 1, resetAt: now + WINDOW * 1000 });
    return { ok: 1 <= MAX, count: 1, remaining: MAX - 1, resetIn: WINDOW };
  }

  if (now > entry.resetAt) {
    memoryStore.set(key, { count: 1, resetAt: now + WINDOW * 1000 });
    return { ok: 1 <= MAX, count: 1, remaining: MAX - 1, resetIn: WINDOW };
  }

  entry.count += 1;
  const resetIn = Math.ceil((entry.resetAt - now) / 1000);

  return {
    ok: entry.count <= MAX,
    count: entry.count,
    remaining: Math.max(0, MAX - entry.count),
    resetIn,
  };
}
