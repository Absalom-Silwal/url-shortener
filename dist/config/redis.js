"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/config/redis.ts
const redis_1 = require("redis");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
let redisClient = (0, redis_1.createClient)({
    url: process.env.REDIS_URL || "redis://redis:6379"
});
if (process.env.NODE_ENV !== "ut") {
    //redis connection
    redisClient.connect().then(result => {
        console.log('redis connected sucessfully');
    }).catch(err => {
        console.error("Redis connection error:", err);
    });
}
exports.default = redisClient;
