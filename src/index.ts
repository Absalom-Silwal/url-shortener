import express,{Application} from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import userRoutes from "./routes/url.routes.ts";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/users", userRoutes);


// MongoDB Connection
const mongoUrl = process.env.MONGO_URI;
console.log(mongoUrl)
if(!mongoUrl){
  throw new Error('MONGO_URI is not defined in environment variables')
}
mongoose.connect(mongoUrl)
.then(() => console.log("MongoDB connected"))
.catch(err => console.error("MongoDB connection error:", err));

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
