import { Router } from "express";
import auth from "../middleware/auth.js";
import admin from "../middleware/admin.js";
import { overview } from "../controllers/adminController.js";

const router = Router();

router.get("/overview", auth, admin, overview);

export default router;
