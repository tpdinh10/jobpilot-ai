import OpenAI from "openai";
import { env } from "../config/env.js";
import {
  buildAnalyzeMatchPrompt,
  buildImproveResumePrompt,
  buildCoverLetterPrompt,
} from "./promptService.js";

const client = new OpenAI({
  apiKey: env.openAiApiKey,
});

const isFallbackEnabled =
  String(process.env.AI_FALLBACK_ENABLED || "false").toLowerCase() === "true";

const openAiModel = process.env.OPENAI_MODEL || "gpt-4.1-mini";

const safeJsonParse = (content) => {
  try {
    return JSON.parse(content);
  } catch {
    return null;
  }
};

const validateTextInputs = (resumeText, jobDescription) => {
  if (!resumeText || !jobDescription) {
    throw new Error("resumeText and jobDescription are required");
  }
};

const buildFallbackAnalyzeMatch = () => {
  return {
    source: "fallback",
    matchScore: 75,
    matchedSkills: ["Node.js", "Express", "MongoDB"],
    missingSkills: ["AWS", "Docker", "CI/CD"],
    explanation: [
      "The resume shows backend development experience.",
      "The resume includes API and database work.",
      "The job asks for cloud and deployment tools not clearly shown in the resume.",
    ],
    summary:
      "Strong backend foundation, but cloud and deployment skills are not clearly shown.",
  };
};

const buildFallbackImproveResume = () => {
  return {
    source: "fallback",
    technical: [
      "Add cloud tools such as AWS if you have used them.",
      "Mention deployment tools like Docker if relevant.",
    ],
    wording: [
      "Use stronger action verbs such as built, designed, and implemented.",
      "Make bullet points more results-focused.",
    ],
    structure: [
      "Place the strongest backend project first.",
      "Keep bullets concise and easier to scan.",
    ],
    betterBulletPoints: [
      "Built RESTful APIs using Node.js, Express, and MongoDB with JWT authentication.",
      "Developed backend features for resume and job tracking with user-scoped data access.",
    ],
    missingKeywords: ["AWS", "Docker", "CI/CD"],
    summary:
      "Resume can be improved by adding stronger action verbs, clearer impact, and missing technical keywords.",
  };
};

const buildFallbackCoverLetter = () => {
  return {
    source: "fallback",
    coverLetter:
      "Dear Hiring Manager,\n\nI am excited to apply for this role because my background in backend development, REST API design, and database-driven applications aligns well with your requirements. Through projects using Node.js, Express, and MongoDB, I have built secure and scalable features that strengthened my problem-solving and software engineering skills. I would welcome the opportunity to contribute my technical skills and continue growing as part of your team.\n\nSincerely,\nKate Dinh",
    summary:
      "Generated a general backend-focused cover letter based on resume and job description.",
  };
};

const createChatCompletion = async (prompt) => {
  if (!env.openAiApiKey) {
    throw new Error("OPENAI_API_KEY is missing");
  }

  const response = await client.chat.completions.create({
    model: openAiModel,
    messages: [
      {
        role: "system",
        content: "Return only valid JSON with no markdown and no extra text.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.3,
  });

  const content = response.choices?.[0]?.message?.content?.trim();

  if (!content) {
    throw new Error("Empty response received from AI");
  }

  return content;
};

const handleAiError = (featureName, error) => {
  console.error(`[AI SERVICE] ${featureName} failed:`, error.message);

  if (!isFallbackEnabled) {
    throw new Error(`AI request failed: ${error.message}`);
  }
};

export const analyzeMatch = async (resumeText, jobDescription) => {
  try {
    validateTextInputs(resumeText, jobDescription);

    const prompt = buildAnalyzeMatchPrompt(resumeText, jobDescription);
    const content = await createChatCompletion(prompt);
    const parsed = safeJsonParse(content);

    if (!parsed) {
      throw new Error("Failed to parse AI response into JSON");
    }

    return {
      source: "real",
      matchScore: typeof parsed.matchScore === "number" ? parsed.matchScore : 0,
      matchedSkills: Array.isArray(parsed.matchedSkills)
        ? parsed.matchedSkills
        : [],
      missingSkills: Array.isArray(parsed.missingSkills)
        ? parsed.missingSkills
        : [],
      explanation: Array.isArray(parsed.explanation)
        ? parsed.explanation
        : [],
      summary:
        typeof parsed.summary === "string"
          ? parsed.summary
          : "Match analysis completed successfully.",
    };
  } catch (error) {
    handleAiError("analyzeMatch", error);
    return buildFallbackAnalyzeMatch();
  }
};

export const improveResume = async (resumeText, jobDescription) => {
  try {
    validateTextInputs(resumeText, jobDescription);

    const prompt = buildImproveResumePrompt(resumeText, jobDescription);
    const content = await createChatCompletion(prompt);
    const parsed = safeJsonParse(content);

    if (!parsed) {
      throw new Error("Failed to parse AI response into JSON");
    }

    return {
      source: "real",
      technical: Array.isArray(parsed.technical) ? parsed.technical : [],
      wording: Array.isArray(parsed.wording) ? parsed.wording : [],
      structure: Array.isArray(parsed.structure) ? parsed.structure : [],
      betterBulletPoints: Array.isArray(parsed.betterBulletPoints)
        ? parsed.betterBulletPoints
        : [],
      missingKeywords: Array.isArray(parsed.missingKeywords)
        ? parsed.missingKeywords
        : [],
      summary:
        typeof parsed.summary === "string"
          ? parsed.summary
          : "Resume improvement completed successfully.",
    };
  } catch (error) {
    handleAiError("improveResume", error);
    return buildFallbackImproveResume();
  }
};

export const generateCoverLetter = async (resumeText, jobDescription) => {
  try {
    validateTextInputs(resumeText, jobDescription);

    const prompt = buildCoverLetterPrompt(resumeText, jobDescription);
    const content = await createChatCompletion(prompt);
    const parsed = safeJsonParse(content);

    if (!parsed) {
      throw new Error("Failed to parse AI response into JSON");
    }

    return {
      source: "real",
      coverLetter:
        typeof parsed.coverLetter === "string" ? parsed.coverLetter : "",
      summary:
        typeof parsed.summary === "string"
          ? parsed.summary
          : "Cover letter generated successfully.",
    };
  } catch (error) {
    handleAiError("generateCoverLetter", error);
    return buildFallbackCoverLetter();
  }
};