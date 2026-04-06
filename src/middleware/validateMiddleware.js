export const validateAnalyzeMatch = (req, res, next) => {
  const { resumeId, jobId } = req.body;

  if (!resumeId || !jobId) {
    return res.status(400).json({
      success: false,
      message: "resumeId and jobId are required",
    });
  }

  next();
};

export const validateImproveResume = (req, res, next) => {
  const { resumeId, jobId } = req.body;

  if (!resumeId || !jobId) {
    return res.status(400).json({
      success: false,
      message: "resumeId and jobId are required",
    });
  }

  next();
};

export const validateGenerateCoverLetter = (req, res, next) => {
  const { resumeId, jobId } = req.body;

  if (!resumeId || !jobId) {
    return res.status(400).json({
      success: false,
      message: "resumeId and jobId are required",
    });
  }

  next();
};