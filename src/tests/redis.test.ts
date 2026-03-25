import Url from "../models/url.model.ts";
//import { getLongUrl } from "../services/urlService";
import redisClient from "../config/redis.ts";
import { readData,writeData } from "../helpers/redis.ts";
import dotenv from "dotenv";

dotenv.config();

jest.mock("../models/url.model.ts");
jest.mock("../config/redis.ts",() => ({ get: jest.fn(), set: jest.fn(), }));

describe("Cahce URL",()=>{
  test('redis cache url',()=>{
    expect(process.env.REDIS_URL).toBe('redis://redis:6379');
  });
});


describe("write and read to cache", () => {
  test("returns cached value when Redis has the key", async () => {
    // Mock behavior
    //redisClient.set.mockResolvedValue("OK");
    //redisClient.get.mockResolvedValue("https://www.google.com");

    await writeData("abc123", "https://www.google.com");
    const cachedValue = await readData("abc123");
    console.log(cachedValue)

    expect(redisClient.set).toHaveBeenCalledWith(
      "abc123",
      "https://www.google.com",
      { EX: 94608000 }
    );

    expect(redisClient.get).toHaveBeenCalledWith("abc123");
    //expect(cachedValue).toBe("https://www.google.com");
  });
});

