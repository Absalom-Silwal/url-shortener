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

export async function readMultipleKeysFromCache(pattern:string){
    const keys = [];
    for await (const key of redisClient.scanIterator({
        MATCH: pattern,
        COUNT: 500
    })) {
        console.log('keuy',key)
        if(key){
            keys.push(key);
        }
        
    }
    console.log('keys',keys)
    return keys
}

export async function getMultipleValuesFromCache(keys:string[]){
    const pipeline = redisClient.multi();
    keys.forEach(key => pipeline.get(key));

    const results = await pipeline.exec();
    //console.log(results)
    const parsed = results.map((result) => {

        if (result === null) {
            return null; // key not found
        }
        if (typeof result === "string") {
             try {
            
                return JSON.parse(result);
            } catch {
                return result;
            }
        }
       
    });

    return parsed;
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

