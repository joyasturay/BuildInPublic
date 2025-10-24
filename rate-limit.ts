import Redis from "ioredis"
const REDIS_URL=process.env.REDIS_URL|| null;
let redis:Redis|null=null;
if(REDIS_URL)redis=new Redis(REDIS_URL);

type Window={
    count:number;
    resetAt:number;
}
const memoryStore=new Map<String,Window>();
const MAX=Number(process.env.RATE_LIMIT_MAX??3);
const WINDOW=Number(process.env.RATE_LIMIT_WINDOW??3600);
export async function checkRateLimit(key:string){
    if(redis){
        const redisKey=`rl:${key}`
        const ttl=await redis.ttl(redisKey)
        const count=await redis.incr(redisKey);
        if(ttl==-1){
            await redis.expire(redisKey,WINDOW);
        }
        const remaining=Math.max(0,MAX-count);
        return {
            ok:count<=MAX,
            count,
            remaining,
            resetIn:(await redis.ttl(redisKey))
        }
    }else{
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
    return { ok: entry.count <= MAX, count: entry.count, remaining: Math.max(0, MAX - entry.count), resetIn };
    }
}