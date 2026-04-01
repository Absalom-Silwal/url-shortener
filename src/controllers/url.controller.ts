import Url from "../models/url.model";
import bs58 from "bs58";
import { createClient } from "redis";
import {Request,Response} from "express"
import { createSnowflake,Base62,ttlCalculation,strToDate } from "../helpers/helpers";
import { readFromCache,writeToCache } from "../helpers/redis";


// shorten Url
export const shortUrl = async (req:Request, res:Response) => {
  try {
    const {longUrl} = req.body;
    //first checking long url exists or not on redis
    const cached = await readFromCache(`long:${longUrl}`);
    if (cached) {
      const short_code_cached = await readFromCache(`short:${cached.short_code}`)
      console.log('short_code_cached',short_code_cached)
      return res.status(200).json({
        long_url: longUrl,
        short_url: `https://api.shortly.com/${cached.short_code}`,
        short_code: cached.short_code,
        expired_at: ttlCalculation(strToDate(short_code_cached.createdAt)),
        count : short_code_cached.count || 0
      });
    }

    //Search if the url exists or not in the database
    const urlExists = await Url.findOne({long_url:longUrl});
    if(urlExists){
      //cache it to redis for next time
      const expiredDate = ttlCalculation(urlExists.createdAt)
      
      await writeToCache(`long:${longUrl}`,JSON.stringify({
          long_url: longUrl,
          short_code: urlExists.short_code,
          createdAt: urlExists.createdAt
        }));
      await writeToCache(`short:${urlExists.short_code}`, JSON.stringify({
        long_url: longUrl,
        short_code: urlExists.short_code,
        createdAt: urlExists.created_at,
        count: 0
      }));

      //returning the value if url exists
      return res.status(201).json({
        long_url:longUrl,
        short_url:`https//api.shortly.com/${urlExists.short_code}`,
        short_code:urlExists.short_code,
        expired_at:ttlCalculation(urlExists.created_at),
        count: 0
      });
    }

    //use snowflake technique for unique ID generation
    const snowflake = createSnowflake(10);
    const uniId = snowflake().toString();

    //Base62 encoding
    const encodedId = Base62(BigInt(uniId));


    const urlDb = await Url.findOneAndUpdate({short_code:encodedId},{long_url:longUrl},{ new: true, upsert: true });
    
    //caching long url
    await writeToCache(`long:${longUrl}`,
      JSON.stringify({
        long_url:longUrl,
        short_code: encodedId,
        createdAt: urlDb.created_at
      }));

    //caching short code
    await writeToCache(`short:${encodedId}`,
      JSON.stringify({
        long_url: longUrl,
        short_code:encodedId,
        createdAt: urlDb.created_at,
        count : 0
      }));

    res.status(201).json({
      long_url:longUrl,
      short_url:`https//api.shortly.com/${encodedId}`,
      short_code:encodedId,
      expired_at:ttlCalculation(urlDb.created_at),
      count:0
      });

  } catch (error: unknown) {
    if (error instanceof Error){
      res.status(400).json({ error: error.message });
    }
    
  }
};

export const redirectUrl = async (req:Request, res:Response) => {
  try {
    const reqCode = req.params.code;
    const shortCode = Array.isArray(reqCode)?reqCode[0]:reqCode;
    console.log(shortCode);
    let cachedUrl = await readFromCache(`short:${shortCode}`);
    if(!cachedUrl){
      const url = await Url.findOne({short_code:req.params.code});
      if (!url) return res.status(404).json({ message: "Url not found" });
      cachedUrl = await writeToCache(`long:${url.long_url}`,JSON.stringify({
          long_url: url.long_url,
          short_code: url.short_code,
          createdAt: url.created_at
        }));
    }
    console.log('cachedurl',cachedUrl)
    const shortCachedUrl = await writeToCache(
        `short:${shortCode}`,
        JSON.stringify({
          long_url: cachedUrl.long_url,
          short_code: shortCode,
          createdAt: cachedUrl.createdAt,
          count : (cachedUrl.count || 0) + 1
        })
      )
    
    //res.redirect(301,shortCachedUrl.long_url)
    res.status(200).json({'msg':'redirected sucessfully'});
  } catch (error:unknown) {
    if (error instanceof Error){
      res.status(400).json({ error: error.message });
    }
  }
};

export const deleteUrl = async (req:Request, res:Response) => {
  try {
    const deletedUser = await Url.findByIdAndDelete(req.params.id);
    if (!deletedUser) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error:unknown) {
    if (error instanceof Error){
      res.status(400).json({ error: error.message });
    }
  }
};