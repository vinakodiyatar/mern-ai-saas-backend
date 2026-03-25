import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    plan: { type: String, enum: ["free", "pro"], default: "free" },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    usageCount: { type: Number, default: 0 },
    usageLimit: { type: Number, default: 5 },
    lastLoginAt: Date,
  },
  { timestamps: true }
);

userSchema.methods.incrementUsage = async function () {
  this.usageCount += 1;
  return this.save();
};

export default mongoose.model("User", userSchema);
