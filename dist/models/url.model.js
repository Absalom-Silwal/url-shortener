"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const urlSchema = new mongoose_1.default.Schema({
    short_code: { type: String, required: true, unique: true },
    long_url: { type: String, required: true, unique: true },
    created_at: { type: Date, default: Date.now },
}, { timestamps: true });
exports.default = mongoose_1.default.model("Url", urlSchema);
