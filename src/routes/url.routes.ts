import express from "express";
import { shortUrl,redirectUrl,deleteUrl } from "../controllers/url.controller.ts";

const router = express.Router();

router.post("/shorten", shortUrl);
router.get("/:code", redirectUrl);
router.delete("/:id", deleteUrl);

export default router;