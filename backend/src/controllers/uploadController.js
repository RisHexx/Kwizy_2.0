import { execFile } from 'child_process';
import fs from 'fs/promises';
import { promisify } from 'util';
import { Quiz } from '../models/index.js';
import { generateQuiz, generateTitleFromText } from '../services/groqService.js';
import { transcribeUploadWithWhisper } from '../services/whisperService.js';

const execFileAsync = promisify(execFile);
const MAX_VIDEO_SIZE_BYTES = 250 * 1024 * 1024;
const MAX_VIDEO_DURATION_SECONDS = 30 * 60;

const cleanupFile = async (filePath) => {
  if (!filePath) return;
  try {
    await fs.unlink(filePath);
  } catch (error) {
    console.error('Failed to delete upload:', error.message);
  }
};

const parseNumber = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const clampQuestions = (value) => {
  if (value < 5) return 5;
  if (value > 20) return 20;
  return value;
};

const normalizeDifficulty = (value) => {
  const allowed = new Set(['easy', 'medium', 'hard']);
  return allowed.has(value) ? value : 'medium';
};

const getVideoDurationSeconds = async (filePath) => {
  const { stdout } = await execFileAsync('ffprobe', [
    '-v', 'error',
    '-show_entries', 'format=duration',
    '-of', 'default=noprint_wrappers=1:nokey=1',
    filePath
  ]);

  const duration = Number.parseFloat(stdout.trim());
  if (!Number.isFinite(duration)) {
    throw new Error('Unable to determine video duration');
  }

  return duration;
};

const getUploadedVideoMetadata = async (filePath) => {
  const [fileStats, durationSeconds] = await Promise.all([
    fs.stat(filePath),
    getVideoDurationSeconds(filePath)
  ]);

  return {
    sizeBytes: fileStats.size,
    durationSeconds
  };
};

export const generateQuizFromVideoUpload = async (req, res, next) => {
  try {
    const difficulty = normalizeDifficulty(req.body?.difficulty || 'medium');
    const numQuestions = clampQuestions(parseNumber(req.body?.numQuestions, 10));

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a video file'
      });
    }

    const { sizeBytes, durationSeconds } = await getUploadedVideoMetadata(req.file.path);

    if (sizeBytes > MAX_VIDEO_SIZE_BYTES) {
      return res.status(400).json({
        success: false,
        message: 'Video is too large. Maximum allowed size is 250MB.'
      });
    }

    if (durationSeconds > MAX_VIDEO_DURATION_SECONDS) {
      return res.status(400).json({
        success: false,
        message: 'Video is too long. Maximum allowed duration is 30 minutes.'
      });
    }

    const transcriptResult = await transcribeUploadWithWhisper({
      filePath: req.file.path,
      fileName: req.file.originalname,
      mimeType: req.file.mimetype
    });

    if (!transcriptResult.success) {
      return res.status(400).json({
        success: false,
        message: transcriptResult.error || 'Failed to transcribe video'
      });
    }

    const quizResult = await generateQuiz(transcriptResult.fullText, difficulty, numQuestions);
    if (!quizResult.success) {
      return res.status(500).json({
        success: false,
        message: quizResult.error || 'Failed to generate quiz'
      });
    }

    const title = await generateTitleFromText(transcriptResult.fullText, req.file.originalname);

    const quiz = await Quiz.create({
      user: req.user.id,
      title,
      videoUrl: null,
      videoId: null,
      thumbnail: null,
      difficulty,
      questions: quizResult.questions,
      transcript: transcriptResult.fullText,
      sourceType: 'video_upload',
      sourceName: req.file.originalname
    });

    res.status(201).json({
      success: true,
      quiz: {
        id: quiz._id,
        title: quiz.title,
        difficulty: quiz.difficulty,
        questionCount: quiz.questions.length,
        questions: quiz.questions.map(q => ({
          type: q.type,
          question: q.question,
          options: q.options
        }))
      }
    });
  } catch (error) {
    next(error);
  } finally {
    await cleanupFile(req.file?.path);
  }
};
