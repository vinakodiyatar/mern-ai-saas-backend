import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import errorHandler from "./middleware/error.js";
import authRoutes from "./routes/authRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import { connectDB } from "./config/connectDB.js";

const app = express();

app.use(cors());
app.use(express.json({ limit: "1mb" }));

connectDB();

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Too many requests, please try again later." },
  }),
);

app.use("/api/auth", authRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/admin", adminRoutes);

app.use(errorHandler);

export default app;
