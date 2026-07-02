// src/config/redis.ts
import { createClient } from "redis";
import dotenv from "dotenv";

dotenv.config();


let redisClient = createClient({
  url: process.env.REDIS_URL || "redis://redis:6380"
});

if (process.env.NODE_ENV !== "test") {
  //redis connection
  redisClient.connect().then(result=>{
      console.log('redis connected sucessfully')
    }).catch(err => {
      console.error("Redis connection error:", err);
    });
}

export default redisClient;
