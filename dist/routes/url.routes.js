"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const url_controller_1 = require("../controllers/url.controller");
const router = express_1.default.Router();
router.post("/shorten", url_controller_1.shortUrl);
router.get("/code/:code", url_controller_1.redirectUrl);
router.delete("/:id", url_controller_1.deleteUrl);
exports.default = router;
