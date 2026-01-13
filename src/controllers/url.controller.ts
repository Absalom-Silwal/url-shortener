import Url from "../models/url.model.ts";
import bs58 from "bs58";
import {Request,Response} from "express"
import { createSnowflake,Base62 } from "../helpers/helpers.ts";

// shorten Url
export const shortUrl = async (req:Request, res:Response) => {
  try {
    const {url} = req.body;
    //use snowflake technique for unique ID generation
    const snowflake = createSnowflake(10);
    const uniId = snowflake().toString();
    const encodedId = Base62(BigInt(uniId));
    console.log(encodedId);
    //const urlDb = await Url.findOneAndUpdate({short_code:shorten_url},{long_url:url},{ new: true, upsert: true });
    res.status(201).json({uniId:encodedId});
  } catch (error: unknown) {
    if (error instanceof Error){
      res.status(400).json({ error: error.message });
    }
    
  }
};

export const getUrlById = async (req:Request, res:Response) => {
  try {
    const url = await Url.find({short_code:req.params.id});
    if (!url) return res.status(404).json({ message: "Url not found" });
    res.status(200).json(url);
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