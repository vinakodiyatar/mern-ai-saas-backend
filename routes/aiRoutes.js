import { Router } from "express";
import auth from "../middleware/auth.js";
import {
  generate,
  history,
  exportPdf,
  exportDocx,
  streamGenerate,
} from "../controllers/aiController.js";

const router = Router();

router.post("/generate", auth, generate);
router.get("/history", auth, history);
router.get("/export/:id/pdf", auth, exportPdf);
router.get("/export/:id/docx", auth, exportDocx);
router.get("/stream", auth, streamGenerate);

export default router;
