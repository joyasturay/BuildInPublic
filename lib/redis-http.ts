import {Redis} from"@upstash/redis"
if(!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN){
    throw new Error("missing values of upstash redis")
}
export const redisHttp=new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
})