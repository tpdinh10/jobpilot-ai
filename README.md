# JobPilot AI

AI-powered backend API for resume matching, resume improvement, and cover letter generation.

Production-ready REST API with authentication, user-scoped data access, AI integration, and history tracking.
## Live Demo (Deployed API)
Base URL: https://jobpilot-api.onrender.com  

Health Check: GET https://jobpilot-api.onrender.com/health

## Tech Stack
- Node.js
- Express
- MongoDB Atlas
- Mongoose
- JWT Authentication
- AI Integration via :contentReference[oaicite:0]{index=0} API (with fallback support)
- Render Deployment

## 🔥 Features

### 🔐 Authentication
- Register user
- Login user
- Get current user profile
- JWT-protected routes

### 📄 Resume Management
- Create resume
- Get resumes (user-specific)

### 💼 Job Management
- Full CRUD for jobs
- User-scoped data protection

### 🤖 AI Features
- **Analyze Match**
  - Compare resume with job description
  - Returns:
    - matchScore
    - matchedSkills
    - missingSkills

- **Improve Resume**
  - Rewrite resume content into stronger bullet points

- **Generate Cover Letter**
  - Create tailored cover letter from resume + job

- **AI History**
  - Stores previous AI outputs per user

### 🧠 System Features
- Structured AI response formatting
- Fallback AI system when API fails
- Strict user ownership enforcement
- Production deployment on Render

## 📡 API Endpoints

### Auth
- POST /api/auth/register
- POST /api/auth/login
- GET /api/auth/me

---

### Jobs
- POST /api/jobs
- GET /api/jobs
- GET /api/jobs/:id
- PUT /api/jobs/:id
- DELETE /api/jobs/:id

---

### Resumes
- POST /api/resumes
- GET /api/resumes

---

### 🤖 AI (Protected)

All AI routes require:

Authorization: `Bearer <your_jwt_token>`

- POST /api/ai/analyze-match
- POST /api/ai/improve-resume
- POST /api/ai/generate-cover-letter
- GET /api/ai/history

## 📦 Sample AI Response

### POST /api/ai/analyze-match

```json
{
  "success": true,
  "data": {
    "matchScore": 82,
    "matchedSkills": ["Node.js", "Express", "MongoDB"],
    "missingSkills": ["Docker", "AWS"],
    "summary": "Strong backend match with some missing cloud skills."
  }
}
```
## 🛠️ Getting Started

### 1. Clone the repo
```bash
git clone https://github.com/tpdinh10/jobpilot-ai.git
cd jobpilot-api
```

### 2. Install dependencies
```bash
npm install
```

### 3. Create a .env file
(.env should not be committed)

```env
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
OPENAI_API_KEY=your_openai_api_key
```

### 4. Run the server
```bash
npm run dev
```
Server runs at: `http://localhost:5000`

## Quick Test Flow

1. Register or login to obtain a JWT token.

2. Create a job:

`POST /api/jobs`
```json
{
  "title": "Backend Engineer",
  "company": "DemoCorp",
  "description": "Node.js MongoDB Express JWT React Git"
}
```
3. Create a resume:

`POST /api/resumes`
```json
{
  "title": "Resume v1",
  "content": "Built REST APIs with Node, Mongo, Express and Git."
}
```
4. Analyze match:

`POST /api/ai/analyze-match`
```json
{
  "jobId": "<job_id>",
  "resumeId": "<resume_id>"
}
```

All protected routes require:

`Authorization: Bearer <your_jwt_token>`