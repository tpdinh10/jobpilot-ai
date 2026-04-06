import Resume from "../models/Resume.js";
import Job from "../models/Job.js";
import AIAnalysis from "../models/AIAnalysis.js";
import {
  analyzeMatch,
  improveResume,
  generateCoverLetter,
} from "../services/aiService.js";

export const analyzeMatchController = async (req, res, next) => {
  try {
    const { resumeId, jobId } = req.body;

    const resume = await Resume.findOne({
      _id: resumeId,
      userId: req.user._id,
    });

    const job = await Job.findOne({
      _id: jobId,
      userId: req.user._id,
    });

    if (!resume || !job) {
      return res.status(404).json({
        success: false,
        message: "Resume or job not found",
      });
    }

    const result = await analyzeMatch(resume.content, job.description);

    const savedAnalysis = await AIAnalysis.create({
      user: req.user._id,
      resume: resume._id,
      job: job._id,
      type: "match-analysis",
      inputResumeText: resume.content,
      inputJobDescription: job.description,
      output: result,
    });

    return res.status(200).json({
      success: true,
      message: "Match analysis completed successfully",
      data: savedAnalysis,
    });
  } catch (error) {
    next(error);
  }
};

export const improveResumeController = async (req, res, next) => {
  try {
    const { resumeId, jobId } = req.body;

    const resume = await Resume.findOne({
      _id: resumeId,
      userId: req.user._id,
    });

    const job = await Job.findOne({
      _id: jobId,
      userId: req.user._id,
    });

    if (!resume || !job) {
      return res.status(404).json({
        success: false,
        message: "Resume or job not found",
      });
    }

    const result = await improveResume(resume.content, job.description);

    const savedAnalysis = await AIAnalysis.create({
      user: req.user._id,
      resume: resume._id,
      job: job._id,
      type: "resume-improvement",
      inputResumeText: resume.content,
      inputJobDescription: job.description,
      output: result,
    });

    return res.status(200).json({
      success: true,
      message: "Resume improvement completed successfully",
      data: savedAnalysis,
    });
  } catch (error) {
    next(error);
  }
};

export const generateCoverLetterController = async (req, res, next) => {
  try {
    const { resumeId, jobId } = req.body;

    const resume = await Resume.findOne({
      _id: resumeId,
      userId: req.user._id,
    });

    const job = await Job.findOne({
      _id: jobId,
      userId: req.user._id,
    });

    if (!resume || !job) {
      return res.status(404).json({
        success: false,
        message: "Resume or job not found",
      });
    }

    const result = await generateCoverLetter(resume.content, job.description);

    const savedAnalysis = await AIAnalysis.create({
      user: req.user._id,
      resume: resume._id,
      job: job._id,
      type: "cover-letter",
      inputResumeText: resume.content,
      inputJobDescription: job.description,
      output: result,
    });

    return res.status(200).json({
      success: true,
      message: "Cover letter generated successfully",
      data: savedAnalysis,
    });
  } catch (error) {
    next(error);
  }
};

export const getAIHistoryController = async (req, res, next) => {
  try {
    const history = await AIAnalysis.find({ user: req.user._id })
      .populate("resume", "title")
      .populate("job", "title company")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "AI history fetched successfully",
      data: history,
    });
  } catch (error) {
    next(error);
  }
};