````md
# Backend - AI Marketing SaaS (Node.js + Express)

## Overview

This is the backend API for an AI-powered digital marketing SaaS platform.

It handles:

- Authentication (JWT)
- AI integrations (Gemini + Mistral)
- Data storage (MongoDB)
- Usage limits and request logging

---

## Tech Stack

- Node.js
- Express.js
- MongoDB (Mongoose)
- JWT Authentication

---

## Setup Instructions

### Clone the repository

```bash
git clone https://github.com/vinakodiyatar/mern-ai-saas-backend.git
cd backend
```
````

### Install dependencies

```bash
npm install
```

### Run server

```bash
npm start
```

---

## Environment Variables

Create a `.env` file:

```bash
PORT=
MONGO_URI=
JWT_SECRET=
GEMINI_API_KEY=
MISTRAL_API_KEY=
```

---

## Live API

[https://mern-ai-saas-backend.onrender.com]

---

## Architecture

The backend is structured as follows:

- **Routes** → Define API endpoints
- **Controllers** → Handle request/response
- **Services** → Business logic & AI calls
- **Models** → MongoDB schemas

---

## AI Integration

### Primary AI: Google Gemini

- Used for main content generation

### Fallback AI: Mistral

- Automatically triggered if Gemini fails

## # Flow:

1. Request → Gemini
2. If error → Mistral
3. Response → Client

This ensures reliability and better uptime.

---

## Features

- JWT Authentication
- Multi-tenant data isolation
- Usage quota system
- API rate limiting
- Structured error handling

---

## API Endpoints

- POST /api/auth/register
- POST /api/auth/login
- POST /api/ai/generate
- GET /api/history

---

## Limitations

- No caching layer
- Basic quota system
- Limited logging

---

## 🧩 Supported Use Cases

The application supports multiple digital marketing workflows:

### 1. Product / Service Content Generation
- Input:
  - Product or Service (required)
  - Target Audience
  - Optional Keywords
- Output:
  - Marketing content (captions, ad copy, etc.)

### 2. SEO / Google Ads Content
- Input:
  - Target Keyword (required)
  - Reference URL or Topic (optional)
- Output:
  - SEO-optimized content
  - Google Ads style copy

Different prompt structures are used for each use case to generate more relevant and high-quality AI responses.

## Future Improvements

- Add Redis caching
- Add subscription tiers
- Add monitoring/logging tools
- Add streaming AI responses
