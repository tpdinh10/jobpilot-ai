import Resume from "../models/Resume.js";
import { PDFParse } from "pdf-parse";

export const createResume = async (req, res, next) => {
  try {
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: "Title and content are required",
      });
    }

    const resume = await Resume.create({
      userId: req.user._id,
      title,
      content,
    });

    return res.status(201).json({
      success: true,
      message: "Resume created successfully",
      data: resume,
    });
  } catch (error) {
    next(error);
  }
};

export const getResumes = async (req, res, next) => {
  try {
    const resumes = await Resume.find({ userId: req.user._id }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      message: "Resumes fetched successfully",
      data: resumes,
    });
  } catch (error) {
    next(error);
  }
};

export const getResumeById = async (req, res, next) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: "Resume not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Resume fetched successfully",
      data: resume,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Invalid resume id",
    });
  }
};

export const deleteResume = async (req, res, next) => {
  try {
    const resume = await Resume.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: "Resume not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Resume deleted successfully",
      data: resume,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Invalid resume id",
    });
  }
};

export const uploadResumePDF = async (req, res, next) => {
  let parser;

  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please select a PDF file.",
      });
    }

    // Check the PDF file signature
    const signature = req.file.buffer
      .subarray(0, 5)
      .toString("ascii");

    if (signature !== "%PDF-") {
      return res.status(400).json({
        success: false,
        message: "Invalid PDF file.",
      });
    }

    // Extract text using pdf-parse v2
    parser = new PDFParse({
      data: new Uint8Array(req.file.buffer),
    });

    const result = await parser.getText();
    const content = result.text?.trim();

    if (!content) {
      return res.status(422).json({
        success: false,
        message:
          "No readable text found. Please upload a text-based PDF.",
      });
    }

    const title =
      req.body.title?.trim() ||
      req.file.originalname.replace(/\.pdf$/i, "");

    // Save extracted text to MongoDB
    const resume = await Resume.create({
      userId: req.user._id,
      title,
      content,
    });

    return res.status(201).json({
      success: true,
      message: "PDF resume uploaded successfully",
      data: resume,
    });
  } catch (error) {
    next(error);
  } finally {
    if (parser) {
      await parser.destroy().catch(() => {});
    }
  }
};
