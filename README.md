# Kwizy

Kwizy is an AI-powered learning platform that turns videos into quizzes and flashcards. It is built as a full-stack app with a React frontend, an Express backend, MongoDB for storage, and small Python services for transcript and Whisper-based fallback transcription.

## What it does

- Generate quizzes from YouTube videos or uploaded video files.
- Generate flashcards from the same sources.
- Support Google sign-in and authenticated user sessions.
- Store quiz history, scores, and flashcard sets in MongoDB.
- Use Groq to generate questions, flashcards, and titles from transcripts.
- Fall back to transcript extraction or Whisper transcription when needed.

## Tech Stack

- Frontend: React, Vite, React Router, Axios, Tailwind CSS, React Hot Toast
- Backend: Node.js, Express, MongoDB, Mongoose, JWT, Multer, Google Auth Library, Groq SDK
- Services: FastAPI-based transcript service and Whisper service in Python

## Project Structure

- `frontend/` - React app used by end users
- `backend/` - Express API, authentication, quiz generation, flashcards, uploads, and database models
- `transcript-service/` - Python service for fetching YouTube transcripts
- `whisper-service/` - Python service for local Whisper transcription fallback

## Features

- Google OAuth login
- AI-generated quizzes with explanations
- AI-generated flashcards
- Quiz attempts, score history, and profile tracking
- YouTube video support and uploaded video support
- Temporary upload cleanup after processing
- Upload duration limit of 30 minutes and a 250MB file size cap

## Prerequisites

- Node.js 18 or newer
- npm
- Python 3.10 or newer
- MongoDB running locally or a MongoDB Atlas connection string
- A Groq API key
- Google OAuth client credentials

## Setup

### 1. Clone and install dependencies

Install the JavaScript dependencies for both apps:

```bash
cd backend
npm install

cd ../frontend
npm install
```

Install the Python service dependencies:

```bash
cd ../transcript-service
pip install -r requirements.txt

cd ../whisper-service
pip install -r requirements.txt
```

### 2. Configure environment variables

Create a `backend/.env` file with values similar to these:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/kwizy
JWT_SECRET=your-secret-key
JWT_EXPIRE=7d
GOOGLE_CLIENT_ID=your-google-client-id
GROQ_API_KEY=your-groq-api-key
TRANSCRIPT_SERVICE_URL=http://localhost:8001
WHISPER_SERVICE_URL=http://localhost:8000
```

If you are using the Python services on different ports, update the two service URLs accordingly.

### 3. Start MongoDB

Make sure MongoDB is running before starting the backend.

### 4. Start the services

Run each service in its own terminal:

```bash
# backend
cd backend
npm run dev

# frontend
cd frontend
npm run dev

# transcript service
cd transcript-service
uvicorn main:app --reload --port 8001

# whisper service
cd whisper-service
uvicorn main:app --reload --port 8000
```

The frontend runs on `http://localhost:5173`, the backend on `http://localhost:5000`, and Vite proxies API calls from `/api` to the backend.

## API Overview

The backend exposes routes under:

- `/api/auth`
- `/api/quiz`
- `/api/flashcards`
- `/api/user`
- `/api/videos`
- `/api/health`

## Notes

- Uploaded video files are stored temporarily and cleaned up after processing.
- Quiz and flashcard generation works with either YouTube input or uploaded video input, depending on the route.
- The app uses bearer tokens stored in the browser local storage for authenticated requests.

## License

No license has been added yet.
