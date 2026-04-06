import Resume from "../models/Resume.js";

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