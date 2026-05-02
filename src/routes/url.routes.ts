import express from "express";
import cors from "cors";
import { shortUrl,redirectUrl,deleteUrl,analytics } from "../controllers/url.controller";

const router = express.Router();

router.post("/shorten",cors(), shortUrl);
router.get("/code/:code", redirectUrl);
router.get("/analytics",analytics)
router.delete("/:id",cors(), deleteUrl);

export default router;