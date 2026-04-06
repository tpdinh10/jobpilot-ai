export const buildAnalyzeMatchPrompt = (resumeText, jobDescription) => {
  return `
You are an AI assistant for resume-job matching.

Compare the resume with the job description.

Return ONLY valid JSON.
Do not include markdown.
Do not include explanation outside JSON.

Use this exact format:
{
  "matchScore": 0,
  "matchedSkills": [],
  "missingSkills": [],
  "explanation": []
}

Rules:
- matchScore must be a number from 0 to 100
- matchedSkills must be an array of short skill phrases
- missingSkills must be an array of short skill phrases
- explanation must be an array of short bullet-style strings
- keep output concise and structured

Resume:
${resumeText}

Job Description:
${jobDescription}
`;
};

export const buildImproveResumePrompt = (resumeText, jobDescription) => {
  return `
You are an AI resume improvement assistant.

Review the resume against the job description.

Return ONLY valid JSON.
Do not include markdown.
Do not include explanation outside JSON.

Use this exact format:
{
  "technical": [],
  "wording": [],
  "structure": [],
  "betterBulletPoints": [],
  "missingKeywords": []
}

Rules:
- technical = technical improvement suggestions
- wording = writing improvement suggestions
- structure = formatting or section-level suggestions
- betterBulletPoints = rewritten bullet points
- missingKeywords = important missing keywords from the job description
- keep each item short and useful

Resume:
${resumeText}

Job Description:
${jobDescription}
`;
};

export const buildCoverLetterPrompt = (resumeText, jobDescription) => {
  return `
You are an AI assistant that writes short tailored cover letters.

Write a short professional cover letter based on the resume and job description.

Return ONLY valid JSON.
Do not include markdown.
Do not include explanation outside JSON.

Use this exact format:
{
  "coverLetter": ""
}

Rules:
- keep it professional
- keep it concise
- sound natural
- focus on fit for the job
- do not invent unrealistic experience

Resume:
${resumeText}

Job Description:
${jobDescription}
`;
};