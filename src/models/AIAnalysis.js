import mongoose from "mongoose";

const aiAnalysisSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    resume: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resume",
      default: null,
    },
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      default: null,
    },
    type: {
      type: String,
      enum: ["match-analysis", "resume-improvement", "cover-letter"],
      required: true,
    },
    inputResumeText: {
      type: String,
      required: true,
    },
    inputJobDescription: {
      type: String,
      required: true,
    },
    output: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
  },
  { timestamps: true }
);

const AIAnalysis = mongoose.model("AIAnalysis", aiAnalysisSchema);

export default AIAnalysis;