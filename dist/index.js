"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const url_routes_1 = __importDefault(require("./routes/url.routes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Routes
app.use("/api/v1", url_routes_1.default);
// MongoDB Connection
const mongoUrl = process.env.MONGO_URI;
if (!mongoUrl) {
    throw new Error('MONGO_URI is not defined in environment variables');
}
const PORT = process.env.PORT || 5000;
mongoose_1.default.connect(mongoUrl)
    .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
})
    .catch(err => console.error("MongoDB connection error:", err));
