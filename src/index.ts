import express,{Application} from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import userRoutes from "./routes/url.routes";
import redisClient from "./config/redis";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/v1", userRoutes);


// MongoDB Connection
const mongoUrl = process.env.MONGO_URI;

if(!mongoUrl){
  throw new Error('MONGO_URI is not defined in environment variables')
}

const PORT = Number(process.env.PORT) || 5000;
mongoose.connect(mongoUrl)
  .then(() => {
    console.log("MongoDB connected");

    app.listen(PORT,"0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => console.error("MongoDB connection error:", err));






