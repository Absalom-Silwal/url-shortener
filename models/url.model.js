import mongoose from "mongoose";

const urlSchema = new mongoose.Schema({
  short_code: { type: String, required: true },
  long_url: { type: String, required: true, unique: true },
  createdda_at: { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.model("Url", urlSchema);