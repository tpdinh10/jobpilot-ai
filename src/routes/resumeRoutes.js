
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

import {
  createResume,
  getResumes,
  getResumeById,
  deleteResume,
  uploadResumePDF,
} from "../controllers/resumeController.js";

const router = express.Router();

// Create a resume using text
router.post("/", protect, createResume);

// Upload a PDF resume
router.post(
  "/upload",
  protect,
  upload.single("file"),
  uploadResumePDF
);

// Get all resumes
router.get("/", protect, getResumes);

// Get one resume
router.get("/:id", protect, getResumeById);

// Delete a resume
router.delete("/:id", protect, deleteResume);

export default router;
