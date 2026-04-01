"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUrl = exports.redirectUrl = exports.shortUrl = void 0;
const url_model_1 = __importDefault(require("../models/url.model"));
const helpers_1 = require("../helpers/helpers");
const redis_1 = require("../helpers/redis");
// shorten Url
const shortUrl = async (req, res) => {
    try {
        const { longUrl } = req.body;
        //first checking long url exists or not on redis
        const cached = await (0, redis_1.readFromCache)(`long:${longUrl}`);
        if (cached) {
            const short_code_cached = await (0, redis_1.readFromCache)(`short:${cached.short_code}`);
            console.log('short_code_cached', short_code_cached);
            return res.status(200).json({
                long_url: longUrl,
                short_url: `https://api.shortly.com/${cached.short_code}`,
                short_code: cached.short_code,
                expired_at: (0, helpers_1.ttlCalculation)((0, helpers_1.strToDate)(short_code_cached.createdAt)),
                count: short_code_cached.count || 0
            });
        }
        //Search if the url exists or not in the database
        const urlExists = await url_model_1.default.findOne({ long_url: longUrl });
        if (urlExists) {
            //cache it to redis for next time
            const expiredDate = (0, helpers_1.ttlCalculation)(urlExists.createdAt);
            await (0, redis_1.writeToCache)(`long:${longUrl}`, JSON.stringify({
                long_url: longUrl,
                short_code: urlExists.short_code,
                createdAt: urlExists.createdAt
            }));
            await (0, redis_1.writeToCache)(`short:${urlExists.short_code}`, JSON.stringify({
                long_url: longUrl,
                short_code: urlExists.short_code,
                createdAt: urlExists.created_at,
                count: 0
            }));
            //returning the value if url exists
            return res.status(201).json({
                long_url: longUrl,
                short_url: `https//api.shortly.com/${urlExists.short_code}`,
                short_code: urlExists.short_code,
                expired_at: (0, helpers_1.ttlCalculation)(urlExists.created_at),
                count: 0
            });
        }
        //use snowflake technique for unique ID generation
        const snowflake = (0, helpers_1.createSnowflake)(10);
        const uniId = snowflake().toString();
        //Base62 encoding
        const encodedId = (0, helpers_1.Base62)(BigInt(uniId));
        const urlDb = await url_model_1.default.findOneAndUpdate({ short_code: encodedId }, { long_url: longUrl }, { new: true, upsert: true });
        //caching long url
        await (0, redis_1.writeToCache)(`long:${longUrl}`, JSON.stringify({
            long_url: longUrl,
            short_code: encodedId,
            createdAt: urlDb.created_at
        }));
        //caching short code
        await (0, redis_1.writeToCache)(`short:${encodedId}`, JSON.stringify({
            long_url: longUrl,
            short_code: encodedId,
            createdAt: urlDb.created_at,
            count: 0
        }));
        res.status(201).json({
            long_url: longUrl,
            short_url: `https//api.shortly.com/${encodedId}`,
            short_code: encodedId,
            expired_at: (0, helpers_1.ttlCalculation)(urlDb.created_at),
            count: 0
        });
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ error: error.message });
        }
    }
};
exports.shortUrl = shortUrl;
const redirectUrl = async (req, res) => {
    try {
        const reqCode = req.params.code;
        const shortCode = Array.isArray(reqCode) ? reqCode[0] : reqCode;
        console.log(shortCode);
        let cachedUrl = await (0, redis_1.readFromCache)(`short:${shortCode}`);
        if (!cachedUrl) {
            const url = await url_model_1.default.findOne({ short_code: req.params.code });
            if (!url)
                return res.status(404).json({ message: "Url not found" });
            cachedUrl = await (0, redis_1.writeToCache)(`long:${url.long_url}`, JSON.stringify({
                long_url: url.long_url,
                short_code: url.short_code,
                createdAt: url.created_at
            }));
        }
        console.log('cachedurl', cachedUrl);
        const shortCachedUrl = await (0, redis_1.writeToCache)(`short:${shortCode}`, JSON.stringify({
            long_url: cachedUrl.long_url,
            short_code: shortCode,
            createdAt: cachedUrl.createdAt,
            count: (cachedUrl.count || 0) + 1
        }));
        //res.redirect(301,shortCachedUrl.long_url)
        res.status(200).json({ 'msg': 'redirected sucessfully' });
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ error: error.message });
        }
    }
};
exports.redirectUrl = redirectUrl;
const deleteUrl = async (req, res) => {
    try {
        const deletedUser = await url_model_1.default.findByIdAndDelete(req.params.id);
        if (!deletedUser)
            return res.status(404).json({ message: "User not found" });
        res.status(200).json({ message: "User deleted successfully" });
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ error: error.message });
        }
    }
};
exports.deleteUrl = deleteUrl;
