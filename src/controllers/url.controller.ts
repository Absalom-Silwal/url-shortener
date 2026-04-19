import Url from "../models/url.model";
import {Request,Response} from "express"
import { createSnowflake,
        Base62,
        ttlCalculation,
        strToDate,
        getBaseUrl,
        getShorUrl,
        ensureAbsoluteUrl,
        normalizeUrl 
      } from "../helpers/helpers";
import { readFromCache,writeToCache } from "../helpers/redis";




// shorten Url
export const shortUrl = async (req:Request, res:Response) => {
  try {
    const {longUrl: rawLongUrl} = req.body;
    if (!rawLongUrl) {
        return res.status(400).json({ error: "longUrl is required" });
    }
    
    const longUrl = normalizeUrl(rawLongUrl);

    //first checking long url exists or not on redis
    const cached = await readFromCache(`long:${longUrl}`);
    if (cached) {
      const short_code_cached = await readFromCache(`short:${cached.short_code}`)
      //console.log(`Found in cache: long:${longUrl} -> ${cached.short_code}`);
      
      return res.status(200).json({
        long_url: longUrl,
        short_url: getShorUrl(req,cached.short_code),
        short_code: cached.short_code,
        expired_at: ttlCalculation(strToDate(short_code_cached?short_code_cached.createdAt:cached.createdAt)),
        count : (short_code_cached && short_code_cached.count) || 0
      });
    }

    //Search if the url exists or not in the database
    const urlExists = await Url.findOne({long_url:longUrl});
    if(urlExists){
      console.log(`Found in DB: ${longUrl} -> ${urlExists.short_code}`);
      //cache it to redis for next time
      const createdAt = (urlExists as any).created_at || (urlExists as any).createdAt;
      
      await writeToCache(`long:${longUrl}`,JSON.stringify({
          long_url: longUrl,
          short_code: urlExists.short_code,
          createdAt: createdAt
        }));
      await writeToCache(`short:${urlExists.short_code}`, JSON.stringify({
        long_url: longUrl,
        short_code: urlExists.short_code,
        createdAt: createdAt,
        count: 0
      }));

      //returning the value if url exists
      return res.status(201).json({
        long_url:longUrl,
        short_url:getShorUrl(req,urlExists.short_code),
        short_code:urlExists.short_code,
        expired_at:ttlCalculation(createdAt),
        count: 0
      });
    }

    //use snowflake technique for unique ID generation
    const snowflake = createSnowflake(10);
    const uniId = snowflake().toString();

    //Base62 encoding
    const encodedId = Base62(BigInt(uniId));

    const urlDb = await Url.findOneAndUpdate({short_code:encodedId},{long_url:longUrl},{ new: true, upsert: true });
    const createdAt = (urlDb as any).created_at || (urlDb as any).createdAt;

    console.log(`Created new mapping: ${longUrl} -> ${encodedId}`);

    //caching long url
    await writeToCache(`long:${longUrl}`,
      JSON.stringify({
        long_url:longUrl,
        short_code: encodedId,
        createdAt: createdAt
      }));

    //caching short code
    await writeToCache(`short:${encodedId}`,
      JSON.stringify({
        long_url: longUrl,
        short_code:encodedId,
        createdAt: createdAt,
        count : 0
      }));

    res.status(201).json({
      long_url:longUrl,
      short_url:getShorUrl(req,encodedId),
      short_code:encodedId,
      expired_at:ttlCalculation(createdAt),
      count:0
      });

  } catch (error: unknown) {
    if (error instanceof Error){
      res.status(400).json({ error: error.message });
    }
  }
};

export const redirectUrl = async (req: Request, res: Response) => {
  try {
    //removing cors for redirection
    res.removeHeader("Access-Control-Allow-Origin");
    res.removeHeader("Access-Control-Allow-Headers");
    res.removeHeader("Access-Control-Allow-Methods");
    const reqCode = req.params.code;
    const shortCode = Array.isArray(reqCode) ? reqCode[0] : reqCode;
    
    let cachedUrl = await readFromCache(`short:${shortCode}`);

    if (!cachedUrl) {
      const url = await Url.findOne({ short_code: shortCode });
      if (!url) {
          return res.status(404).json({ message: "Url not found" });
      }
      
      const createdAt = (url as any).created_at || (url as any).createdAt;

      cachedUrl = {
        long_url: url.long_url,
        short_code: url.short_code,
        createdAt: createdAt,
        count: 0
      };

      // Populate both caches
      await writeToCache(`long:${url.long_url}`, JSON.stringify({
        long_url: url.long_url,
        short_code: url.short_code,
        createdAt: createdAt
      }));
    }

    const updatedCount = (cachedUrl.count || 0) + 1;
    const shortCachedUrl = await writeToCache(
      `short:${shortCode}`,
      JSON.stringify({
        long_url: cachedUrl.long_url,
        short_code: shortCode,
        createdAt: cachedUrl.createdAt,
        count: updatedCount
      })
    );

    let finalLongUrl = (shortCachedUrl && shortCachedUrl.long_url) || cachedUrl.long_url;
    
    // ENSURE REDIRECT TARGET IS ABSOLUTE
    finalLongUrl = ensureAbsoluteUrl(finalLongUrl);
  
    res.redirect(302, finalLongUrl);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(`Redirect error: ${error.message}`);
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