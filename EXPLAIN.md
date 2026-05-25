# Kwizy - Complete Application Documentation

Kwizy is an AI-powered video learning platform that transforms YouTube videos into interactive quizzes and flashcards.

---

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Database Models](#database-models)
3. [Backend API Routes](#backend-api-routes)
4. [Frontend Pages & API Calls](#frontend-pages--api-calls)
5. [Authentication Flow](#authentication-flow)
6. [AI Generation Flow](#ai-generation-flow)
7. [Environment Variables](#environment-variables)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                 │
│                    (React + Vite)                               │
│                  http://localhost:5173                          │
├─────────────────────────────────────────────────────────────────┤
│  Pages:                                                         │
│  - Home, Login, Dashboard, Generate, Quiz, QuizResults          │
│  - QuizHistory, ScoreDetails, Flashcards, FlashcardStudy        │
│  - Profile                                                      │
│                                                                 │
│  Key Libraries:                                                 │
│  - @react-oauth/google (Google Sign-In)                        │
│  - axios (API calls)                                           │
│  - react-router-dom (routing)                                  │
│  - react-hot-toast (notifications)                             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP (via Vite proxy /api → :5000)
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         BACKEND                                  │
│                    (Express + Node.js)                          │
│                   http://localhost:5000                         │
├─────────────────────────────────────────────────────────────────┤
│  Routes: /api/auth, /api/quiz, /api/flashcards, /api/user      │
│                                                                 │
│  Services:                                                      │
│  - Groq AI (quiz & flashcard generation)                       │
│  - Transcript Service (Python + youtube-transcript-api)        │
│  - Whisper Service (fallback transcription)                    │
│  - Google Auth Library (OAuth verification)                    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ MongoDB Driver
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        DATABASE                                  │
│                        (MongoDB)                                │
│              mongodb://localhost:27017/kwizy                    │
├─────────────────────────────────────────────────────────────────┤
│  Collections:                                                   │
│  - users (Google OAuth users)                                  │
│  - quizzes (generated quizzes with questions)                  │
│  - flashcardsets (generated flashcards)                        │
│  - scores (quiz attempt results)                               │
└─────────────────────────────────────────────────────────────────┘
```

---

## Database Models

### 1. User Model
**Collection:** `users`

Stores user information from Google OAuth.

```javascript
{
  _id: ObjectId,
  googleId: String,        // Unique Google ID (required)
  name: String,            // Display name (max 50 chars)
  email: String,           // Email from Google (unique, lowercase)
  avatar: String,          // Google profile photo URL
  createdAt: Date,
  updatedAt: Date
}
```

**Example:**
```json
{
  "_id": "65f1a2b3c4d5e6f7a8b9c0d1",
  "googleId": "118234567890123456789",
  "name": "Rishabh Kanojia",
  "email": "rishabh@gmail.com",
  "avatar": "https://lh3.googleusercontent.com/a/photo.jpg",
  "createdAt": "2024-03-15T10:30:00.000Z",
  "updatedAt": "2024-03-15T10:30:00.000Z"
}
```

---

### 2. Quiz Model
**Collection:** `quizzes`

Stores AI-generated quizzes with embedded questions.

```javascript
{
  _id: ObjectId,
  user: ObjectId,          // Reference to User
  title: String,           // AI-generated title
  videoUrl: String,        // Original YouTube URL
  videoId: String,         // YouTube video ID
  thumbnail: String,       // Video thumbnail URL
  difficulty: String,      // "easy" | "medium" | "hard"
  questions: [{
    type: String,          // "mcq" | "true_false"
    question: String,      // The question text
    options: [String],     // Answer options
    correctAnswer: String, // Correct option
    explanation: String,   // Why this is correct
    timestamp: Number      // Video timestamp in seconds
  }],
  transcript: String,      // Full transcript (hidden by default)
  createdAt: Date,
  updatedAt: Date
}
```

**Example:**
```json
{
  "_id": "65f2b3c4d5e6f7a8b9c0d1e2",
  "user": "65f1a2b3c4d5e6f7a8b9c0d1",
  "title": "Introduction to Machine Learning",
  "videoUrl": "https://youtube.com/watch?v=abc123",
  "videoId": "abc123",
  "thumbnail": "https://img.youtube.com/vi/abc123/maxresdefault.jpg",
  "difficulty": "medium",
  "questions": [
    {
      "type": "mcq",
      "question": "What is supervised learning?",
      "options": [
        "Learning with labeled data",
        "Learning without labels",
        "Reinforcement learning",
        "Transfer learning"
      ],
      "correctAnswer": "Learning with labeled data",
      "explanation": "Supervised learning uses labeled training data to learn patterns.",
      "timestamp": 125
    }
  ]
}
```

---

### 3. FlashcardSet Model
**Collection:** `flashcardsets`

Stores AI-generated flashcard sets with embedded cards.

```javascript
{
  _id: ObjectId,
  user: ObjectId,          // Reference to User
  title: String,           // AI-generated title
  videoUrl: String,        // Original YouTube URL
  videoId: String,         // YouTube video ID
  thumbnail: String,       // Video thumbnail URL
  cards: [{
    front: String,         // Question/term side
    back: String,          // Answer/definition side
    timestamp: Number      // Video timestamp in seconds
  }],
  createdAt: Date,
  updatedAt: Date
}
```

**Example:**
```json
{
  "_id": "65f3c4d5e6f7a8b9c0d1e2f3",
  "user": "65f1a2b3c4d5e6f7a8b9c0d1",
  "title": "Python Basics Flashcards",
  "videoUrl": "https://youtube.com/watch?v=xyz789",
  "videoId": "xyz789",
  "thumbnail": "https://img.youtube.com/vi/xyz789/maxresdefault.jpg",
  "cards": [
    {
      "front": "What is a variable in Python?",
      "back": "A named container that stores a value in memory.",
      "timestamp": 45
    }
  ]
}
```

---

### 4. Score Model
**Collection:** `scores`

Stores quiz attempt results with detailed answers.

```javascript
{
  _id: ObjectId,
  user: ObjectId,          // Reference to User
  quiz: ObjectId,          // Reference to Quiz
  answers: [{
    questionIndex: Number, // Index of question in quiz
    userAnswer: String,    // User's selected answer
    correctAnswer: String, // Actual correct answer
    isCorrect: Boolean,    // Whether answer was correct
    timestamp: Number      // Video timestamp for review
  }],
  correctAnswers: Number,  // Count of correct answers
  totalQuestions: Number,  // Total questions in quiz
  percentage: Number,      // Score percentage (auto-calculated)
  timeTaken: Number,       // Time in seconds
  completedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

**Example:**
```json
{
  "_id": "65f4d5e6f7a8b9c0d1e2f3a4",
  "user": "65f1a2b3c4d5e6f7a8b9c0d1",
  "quiz": "65f2b3c4d5e6f7a8b9c0d1e2",
  "answers": [
    {
      "questionIndex": 0,
      "userAnswer": "Learning with labeled data",
      "correctAnswer": "Learning with labeled data",
      "isCorrect": true,
      "timestamp": 125
    }
  ],
  "correctAnswers": 8,
  "totalQuestions": 10,
  "percentage": 80,
  "timeTaken": 245,
  "completedAt": "2024-03-15T11:00:00.000Z"
}
```

---

## Backend API Routes

### Authentication Routes (`/api/auth`)

| Method | Endpoint | Auth | Description | Request Body | Response |
|--------|----------|------|-------------|--------------|----------|
| `POST` | `/google` | No | Google OAuth login | `{ credential }` | `{ success, token, user }` |
| `GET` | `/me` | Yes | Get current user | - | `{ success, user }` |

---

### Quiz Routes (`/api/quiz`)

| Method | Endpoint | Auth | Description | Request Body | Response |
|--------|----------|------|-------------|--------------|----------|
| `POST` | `/generate` | Yes | Generate quiz from video | `{ videoUrl, difficulty?, numQuestions? }` | `{ success, quiz }` |
| `GET` | `/` | Yes | Get all user's quizzes | - | `{ success, quizzes }` |
| `GET` | `/:id` | Yes | Get single quiz | - | `{ success, quiz }` |
| `POST` | `/:id/submit` | Yes | Submit quiz answers | `{ answers, timeTaken }` | `{ success, score, results }` |
| `DELETE` | `/:id` | Yes | Delete quiz | - | `{ success }` |

---

### Flashcard Routes (`/api/flashcards`)

| Method | Endpoint | Auth | Description | Request Body | Response |
|--------|----------|------|-------------|--------------|----------|
| `POST` | `/generate` | Yes | Generate flashcards | `{ videoUrl, numCards? }` | `{ success, flashcardSet }` |
| `GET` | `/` | Yes | Get all flashcard sets | - | `{ success, flashcardSets }` |
| `GET` | `/:id` | Yes | Get single set | - | `{ success, flashcardSet }` |
| `DELETE` | `/:id` | Yes | Delete set | - | `{ success }` |

---

### User Routes (`/api/user`)

| Method | Endpoint | Auth | Description | Request Body | Response |
|--------|----------|------|-------------|--------------|----------|
| `GET` | `/profile` | Yes | Get profile + stats | - | `{ success, user, stats }` |
| `PUT` | `/profile` | Yes | Update name | `{ name }` | `{ success, user }` |
| `GET` | `/scores` | Yes | Get score history | - | `{ success, scores }` |
| `GET` | `/scores/:id` | Yes | Get score details | - | `{ success, score, quiz, results }` |
| `GET` | `/dashboard` | Yes | Get dashboard data | - | `{ success, stats, recentQuizzes, recentFlashcards, recentScores }` |

---

## Frontend Pages & API Calls

### Public Pages

| Page | Route | API Calls | Description |
|------|-------|-----------|-------------|
| Home | `/` | None | Landing page with features |
| Login | `/login` | `POST /auth/google` | Google Sign-In button |

---

### Protected Pages

| Page | Route | API Calls | Description |
|------|-------|-----------|-------------|
| Dashboard | `/dashboard` | `GET /user/dashboard` | Stats, recent items |
| Generate | `/generate` | `POST /quiz/generate` or `POST /flashcards/generate` | Create content from video |
| Quiz | `/quiz/:id` | `GET /quiz/:id`, `POST /quiz/:id/submit` | Take a quiz |
| Quiz Results | `/quiz/:id/results` | None (data from state) | View results after submit |
| History | `/history` | `GET /user/scores` | All quiz attempts |
| Score Details | `/history/:id` | `GET /user/scores/:id` | Detailed attempt review |
| Flashcards | `/flashcards` | `GET /flashcards`, `DELETE /flashcards/:id` | List & manage sets |
| Flashcard Study | `/flashcards/:id` | `GET /flashcards/:id` | Study flashcards |
| Profile | `/profile` | `GET /user/profile`, `PUT /user/profile` | View & edit profile |

---

## Authentication Flow

```
┌──────────────────────────────────────────────────────────────────┐
│                    GOOGLE OAUTH FLOW                             │
└──────────────────────────────────────────────────────────────────┘

1. User clicks "Sign in with Google" button
   │
   ▼
2. Google OAuth popup opens (GoogleOAuthProvider)
   │
   ▼
3. User selects Google account
   │
   ▼
4. Google returns ID Token (credential) to frontend
   │
   ▼
5. Frontend sends credential to backend
   │  POST /api/auth/google
   │  Body: { credential: "eyJhbGciOiJSUzI1NiIs..." }
   ▼
6. Backend verifies token with Google Auth Library
   │  - Validates signature
   │  - Extracts: googleId, email, name, picture
   ▼
7. Backend checks if user exists
   │
   ├─── User exists ──→ Update avatar if changed
   │
   └─── New user ────→ Create user in database
   │
   ▼
8. Backend generates JWT token
   │  jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' })
   ▼
9. Backend returns token + user data
   │  { success: true, token: "eyJhbG...", user: {...} }
   ▼
10. Frontend stores token in localStorage
    │  localStorage.setItem('token', token)
    ▼
11. Frontend updates AuthContext state
    │  setUser(user)
    ▼
12. User redirected to /dashboard

┌──────────────────────────────────────────────────────────────────┐
│                 SUBSEQUENT API REQUESTS                          │
└──────────────────────────────────────────────────────────────────┘

All authenticated requests include:
  Authorization: Bearer <jwt_token>

The backend middleware (protect):
  1. Extracts token from header
  2. Verifies with JWT_SECRET
  3. Finds user by decoded ID
  4. Attaches user to req.user
  5. Allows request to proceed
```

---

## AI Generation Flow

```
┌──────────────────────────────────────────────────────────────────┐
│              QUIZ/FLASHCARD GENERATION FLOW                      │
└──────────────────────────────────────────────────────────────────┘

1. User enters YouTube URL + options (difficulty, count)
   │
   ▼
2. Frontend sends request
   │  POST /api/quiz/generate
   │  Body: { videoUrl, difficulty: "medium", numQuestions: 10 }
   ▼
3. Backend extracts video ID from URL
   │  Supports: youtube.com/watch?v=, youtu.be/, etc.
   ▼
4. Backend fetches transcript
  │
  ├─── Try Transcript Service (youtube-transcript-api)
  │    │  POST http://localhost:8001/transcript
  │    │
  │    └─── Success ──→ Return transcript segments
  │
  └─── Fallback to Whisper Service
      │  POST http://localhost:8000/transcribe
      │
      └─── Returns: segments with timestamps
   │
   ▼
5. Backend sends transcript to Groq AI
   │
   │  Model: llama-3.3-70b-versatile
   │
   │  Prompt includes:
   │  - Transcript text
   │  - Difficulty level
   │  - Number of questions
   │  - Output format (JSON)
   │  - Instructions for MCQ/True-False mix
   │  - Request for timestamps
   ▼
6. Groq returns JSON with questions
   │
   │  [
   │    {
   │      "type": "mcq",
   │      "question": "...",
   │      "options": [...],
   │      "correctAnswer": "...",
   │      "explanation": "...",
   │      "timestamp": 125
   │    }
   │  ]
   ▼
7. Backend generates title using AI
   │  "Introduction to Machine Learning Concepts"
   ▼
8. Backend creates Quiz document in MongoDB
   │
   ▼
9. Response sent to frontend
   │  { success: true, quiz: {...} }
   ▼
10. Frontend navigates to /quiz/:id
```

---

## Environment Variables

### Backend (`backend/.env`)

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/kwizy

# JWT Authentication
JWT_SECRET=your_secret_key_here
JWT_EXPIRE=7d

# Google OAuth
GOOGLE_CLIENT_ID=123456789-abc.apps.googleusercontent.com

# AI Service
GROQ_API_KEY=gsk_xxxxxxxxxxxxx

# Whisper Fallback (optional)
WHISPER_SERVICE_URL=http://localhost:8000

# Transcript Service (optional)
TRANSCRIPT_SERVICE_URL=http://localhost:8001
```

### Frontend (`frontend/.env`)

```env
# Google OAuth (same Client ID as backend)
VITE_GOOGLE_CLIENT_ID=123456789-abc.apps.googleusercontent.com
```

### Transcript Service (`transcript-service/.env`)

```env
# Preferred transcript languages (priority order)
YOUTUBE_LANGUAGES=en

# Optional proxy settings
YOUTUBE_PROXY_HTTP_URL=
YOUTUBE_PROXY_HTTPS_URL=

# Optional cookies file path
YOUTUBE_COOKIES_PATH=
```

---

## Request/Response Examples

### Google Login

**Request:**
```http
POST /api/auth/google
Content-Type: application/json

{
  "credential": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "65f1a2b3c4d5e6f7a8b9c0d1",
    "name": "Rishabh Kanojia",
    "email": "rishabh@gmail.com",
    "avatar": "https://lh3.googleusercontent.com/a/photo.jpg"
  }
}
```

---

### Generate Quiz

**Request:**
```http
POST /api/quiz/generate
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json

{
  "videoUrl": "https://www.youtube.com/watch?v=abc123",
  "difficulty": "medium",
  "numQuestions": 10
}
```

**Response:**
```json
{
  "success": true,
  "quiz": {
    "_id": "65f2b3c4d5e6f7a8b9c0d1e2",
    "title": "Introduction to Machine Learning",
    "videoId": "abc123",
    "thumbnail": "https://img.youtube.com/vi/abc123/maxresdefault.jpg",
    "difficulty": "medium",
    "questions": [
      {
        "type": "mcq",
        "question": "What is supervised learning?",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "explanation": "...",
        "timestamp": 125
      }
    ]
  }
}
```

---

### Submit Quiz

**Request:**
```http
POST /api/quiz/65f2b3c4d5e6f7a8b9c0d1e2/submit
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json

{
  "answers": ["Option A", "True", "Option C"],
  "timeTaken": 245
}
```

**Response:**
```json
{
  "success": true,
  "score": {
    "correctAnswers": 8,
    "totalQuestions": 10,
    "percentage": 80,
    "timeTaken": 245
  },
  "results": [
    {
      "question": "What is supervised learning?",
      "userAnswer": "Option A",
      "correctAnswer": "Option A",
      "isCorrect": true,
      "explanation": "...",
      "timestampLink": null
    },
    {
      "question": "Neural networks require...",
      "userAnswer": "Option B",
      "correctAnswer": "Option C",
      "isCorrect": false,
      "explanation": "...",
      "timestampLink": "https://youtube.com/watch?v=abc123&t=340s"
    }
  ]
}
```

---

### Dashboard

**Request:**
```http
GET /api/user/dashboard
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Response:**
```json
{
  "success": true,
  "stats": {
    "quizCount": 5,
    "flashcardSetCount": 3,
    "totalQuizzesTaken": 12,
    "averageScore": 78
  },
  "recentQuizzes": [
    {
      "_id": "...",
      "title": "Machine Learning Basics",
      "thumbnail": "...",
      "difficulty": "medium",
      "createdAt": "2024-03-15T10:00:00.000Z"
    }
  ],
  "recentFlashcards": [
    {
      "_id": "...",
      "title": "Python Fundamentals",
      "thumbnail": "...",
      "cardCount": 15,
      "createdAt": "2024-03-14T09:00:00.000Z"
    }
  ],
  "recentScores": [
    {
      "_id": "...",
      "quiz": { "title": "...", "thumbnail": "..." },
      "percentage": 85,
      "completedAt": "2024-03-15T11:00:00.000Z"
    }
  ]
}
```

---

## File Structure

```
Project/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js              # MongoDB connection
│   │   ├── controllers/
│   │   │   ├── authController.js   # Google OAuth, getMe
│   │   │   ├── quizController.js   # Quiz CRUD + generation
│   │   │   ├── flashcardController.js
│   │   │   └── userController.js   # Profile, scores, dashboard
│   │   ├── middleware/
│   │   │   ├── auth.js            # JWT protection
│   │   │   └── errorHandler.js
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Quiz.js
│   │   │   ├── FlashcardSet.js
│   │   │   └── Score.js
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── quiz.js
│   │   │   ├── flashcard.js
│   │   │   └── user.js
│   │   ├── services/
│   │   │   ├── groqService.js     # AI generation
│   │   │   ├── transcriptService.js
│   │   │   └── whisperService.js
│   │   └── index.js               # Express app entry
│   ├── .env
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   └── Navbar.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx    # Auth state management
    │   ├── pages/
    │   │   ├── Home.jsx
    │   │   ├── Login.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── Generate.jsx
    │   │   ├── Quiz.jsx
    │   │   ├── QuizResults.jsx
    │   │   ├── QuizHistory.jsx
    │   │   ├── ScoreDetails.jsx
    │   │   ├── Flashcards.jsx
    │   │   ├── FlashcardStudy.jsx
    │   │   └── Profile.jsx
    │   ├── services/
    │   │   └── api.js             # Axios instance
    │   ├── App.jsx                # Routes
    │   └── main.jsx               # Entry point
    ├── .env
    └── package.json
```

---

## Summary

| Component | Technology | Purpose |
|-----------|------------|---------|
| Frontend | React + Vite | User interface |
| Backend | Express + Node.js | REST API |
| Database | MongoDB + Mongoose | Data storage |
| Auth | Google OAuth + JWT | Authentication |
| AI | Groq (Llama 3.3 70B) | Content generation |
| Transcription | YouTube API + Whisper | Video transcripts |
