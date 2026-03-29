import redisClient  from "../config/redis.ts";

export async function readData(key:string) {
    const cachedValue = await redisClient.get(key)
    return cachedValue
}

export async function writeData(key:string,dataToCache:string) {
     try {
      await redisClient.set(key, dataToCache, {
            EX: 94608000, // 3years
        });
    } catch (e) {
      console.error(`Failed to cache data for key=${key}`, e);
    }
}