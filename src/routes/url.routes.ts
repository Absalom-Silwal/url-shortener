import express from "express";
import cors from "cors";
import { shortUrl,redirectUrl,deleteUrl } from "../controllers/url.controller";

const router = express.Router();

router.post("/shorten",cors(), shortUrl);
router.get("/code/:code", redirectUrl);
router.delete("/:id",cors(), deleteUrl);

export default router;