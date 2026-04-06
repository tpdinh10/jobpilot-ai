import Job from "../models/Job.js";

export const createJob = async (req, res, next) => {
  try {
    const { title, company, link, description, status, dateApplied } = req.body;

    if (!title || !company) {
      return res.status(400).json({
        success: false,
        message: "Title and company are required",
      });
    }

    // Ensure user exists (important safety)
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const job = await Job.create({
      userId: req.user._id,
      title,
      company,
      link,
      description,
      status,
      dateApplied,
    });

    return res.status(201).json({
      success: true,
      message: "Job created successfully",
      data: job,
    });
  } catch (err) {
    next(err);
  }
};

export const getJobs = async (req, res, next) => {
  try {
    const jobs = await Job.find({ userId: req.user._id }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      message: "Jobs fetched successfully",
      data: jobs,
    });
  } catch (err) {
    next(err);
  }
};

export const getJobById = async (req, res, next) => {
  try {
    const job = await Job.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Job fetched successfully",
      data: job,
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: "Invalid job id",
    });
  }
};

export const updateJob = async (req, res, next) => {
  try {
    const updates = req.body;

    const job = await Job.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      updates,
      { new: true, runValidators: true }
    );

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Job updated successfully",
      data: job,
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: "Update failed",
      error: err.message,
    });
  }
};

export const deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Job deleted successfully",
      data: job,
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: "Invalid job id",
    });
  }
};