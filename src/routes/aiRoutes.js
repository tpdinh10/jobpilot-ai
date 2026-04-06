import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  validateAnalyzeMatch,
  validateImproveResume,
  validateGenerateCoverLetter,
} from "../middleware/validateMiddleware.js";
import {
  analyzeMatchController,
  improveResumeController,
  generateCoverLetterController,
  getAIHistoryController,
} from "../controllers/aiController.js";

const router = express.Router();

router.post(
  "/analyze-match",
  protect,
  validateAnalyzeMatch,
  analyzeMatchController
);

router.post(
  "/improve-resume",
  protect,
  validateImproveResume,
  improveResumeController
);

router.post(
  "/generate-cover-letter",
  protect,
  validateGenerateCoverLetter,
  generateCoverLetterController
);

router.get("/history", protect, getAIHistoryController);

export default router;