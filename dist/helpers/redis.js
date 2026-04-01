"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.readFromCache = readFromCache;
exports.writeToCache = writeToCache;
const redis_1 = __importDefault(require("../config/redis"));
async function readFromCache(value) {
    try {
        const redisKey = value;
        const cachedValue = await redis_1.default.get(redisKey);
        if (!cachedValue) {
            return null; // explicit and predictable
        }
        return JSON.parse(cachedValue);
    }
    catch (err) {
        console.error("Redis read error:", err);
        return null; // fail gracefully
    }
}
async function writeToCache(key, dataToCache, ttlSeconds = 94608000) {
    try {
        await redis_1.default.set(key, dataToCache, {
            EX: ttlSeconds,
        });
        const cachedValue = await readFromCache(key);
        return cachedValue;
    }
    catch (e) {
        console.error(`Failed to cache data for key=${key}`, e);
    }
}
