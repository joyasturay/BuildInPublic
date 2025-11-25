// lib/redis.ts
import Redis from "ioredis";

const REDIS_URL = process.env.REDIS_URL ?? null;

let redis: Redis | null = null;

if (REDIS_URL) {
  redis = new Redis(REDIS_URL, {
    maxRetriesPerRequest: null, 
    enableReadyCheck: false,    
    lazyConnect: true,         
  });

  redis.on("error", (err) => {
    console.error("[redis] error:", err.message);
    // we just log; we DON'T let it crash the process
  });
}

export { redis };
