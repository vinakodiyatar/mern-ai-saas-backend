import mongoose from "mongoose";

const contentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  keyword: String,
  module: { type: String, enum: ["seo", "ads"], default: "seo" },
  provider: { type: String, enum: ["gemini", "openai", "fallback"], default: "gemini" },
  result: Object,
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Content", contentSchema);
