# JobPilot AI

AI-powered backend API for resume matching, resume improvement, and cover letter generation.

Deployed production-ready API with authentication, user-scoped data access, and match history tracking.
## Live Demo (Deployed API)
Base URL: https://jobpilot-ai.onrender.com  

Health Check: GET https://jobpilot-ai.onrender.com/health

## Tech Stack
- Node.js
- Express
- MongoDB Atlas
- Mongoose
- JWT Authentication
- Compound Indexing
- Render Deployment

## Features
- User authentication (register, login, profile)
- JWT-protected routes
- Full CRUD for jobs
- Resume version storage
- Resume-to-job match scoring using weighted keyword analysis and normalization
- Normalization and keyword filtering
- Match history tracking
- Strict user ownership enforcement
- Production deployment on Render

## API Endpoints

### Auth
- POST /api/auth/register
- POST /api/auth/login
- GET /api/auth/me

### Jobs
- POST /api/jobs
- GET /api/jobs
- GET /api/jobs/:id
- PUT /api/jobs/:id
- DELETE /api/jobs/:id

### Resumes
- POST /api/resumes
- GET /api/resumes

### Match (protected)
All match routes require:

Authorization: `Bearer <your_jwt_token>`

- POST /api/match
- GET /api/match

#### POST /api/match
Calculates a match score between a saved resume and a saved job description and saves the result.

Headers
Authorization: `Bearer <your_jwt_token>`

Content-Type: `application/json`

Request Body

```json
{
  "jobId": "<job_id>",
  "resumeId": "<resume_id>"
}
```
Example response
```json
{
  "jobId": "<job_id>",
  "resumeId": "<resume_id>",
  "score": 62,
  "matchedKeywords": ["node", "express", "mongodb", "jwt"],
  "missingKeywords": ["docker", "aws"],
  "matchId": "<match_id>"
}
```
`GET /api/match`

Returns saved match history for the logged-in user.

Headers

Authorization: `Bearer <your_jwt_token>`

Example response

```json
{
  "matches": [
    {
      "_id": "<match_id>",
      "jobId": "<job_id>",
      "resumeId": "<resume_id>",
      "score": 62,
      "matchedKeywords": ["node", "express", "mongodb", "jwt"],
      "missingKeywords": ["docker", "aws"],
      "createdAt": "2026-02-10T00:00:00.000Z"
    }
  ]
}
```
## Getting Started

### 1. Clone the repo
```bash
git clone https://github.com/tpdinh10/jobpilot-api.git
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
4. Run match:

`POST /api/match`
```json
{
  "jobId": "<job_id>",
  "resumeId": "<resume_id>"
}
```

All protected routes require:

`Authorization: Bearer <your_jwt_token>`