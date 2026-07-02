import express from "express";
import cors from "cors";
import { shortUrl,redirectUrl,deleteUrl,analytics,latestUrls } from "../controllers/url.controller";

const router = express.Router();

router.post("/shorten",cors(), shortUrl);
router.get("/analytics",analytics)
router.get('/latest-urls', latestUrls);
router.get("/code/:code", redirectUrl);
router.delete("/:id",cors(), deleteUrl);

export default router;