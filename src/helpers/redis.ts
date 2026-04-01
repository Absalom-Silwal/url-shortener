import redisClient  from "../config/redis";

export async function readFromCache(value:string) {
    try {
    const redisKey = value;
    const cachedValue = await redisClient.get(redisKey);

    if (!cachedValue) {
        return null; // explicit and predictable
    }
    return JSON.parse(cachedValue);
    } catch (err) {
        console.error("Redis read error:", err);
        return null; // fail gracefully
    }
   
}

export async function writeToCache(key:string,dataToCache:string,ttlSeconds=94608000 ) {
     try {
        await redisClient.set(key, dataToCache, {
            EX: ttlSeconds, 
        });
        const cachedValue = await readFromCache(key)
        return cachedValue
    } catch (e) {
      console.error(`Failed to cache data for key=${key}`, e);
    }
}