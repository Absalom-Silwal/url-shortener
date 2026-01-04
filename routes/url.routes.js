import express from "express";
import { shortUrl,getUrlById,deleteUrl } from "../controllers/url.controller.js";

const router = express.Router();

router.post("/shorten", shortUrl);
router.get("/:id", getUrlById);
router.delete("/:id", deleteUrl);

export default router;