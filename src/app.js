import express from "express";
import authRoutes from "./routes/authRoutes.js";
import resumeRoutes from "./routes/resumeRoutes.js";
import jobRoutes from "./routes/jobRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import { errorHandler } from "./middleware/errorMiddleware.js";

const app = express();

// Body parser
app.use(express.json());

// Health check route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "JobPilot AI API is running",
  });
});

// Mount routes
app.use("/api/auth", authRoutes);
app.use("/api/resumes", resumeRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/ai", aiRoutes);

// Error middleware must be last
app.use(errorHandler);

export default app;