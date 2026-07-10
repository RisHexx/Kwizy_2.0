import mongoose from 'mongoose';
import fs from 'fs/promises';
import { FlashcardSet } from '../models/index.js';
import {
  fetchYouTubeTranscript,
  generateFlashcards,
  generateTitle,
  generateTitleFromText,
  transcribeUploadWithWhisper
} from '../services/index.js';

const cleanupFile = async (filePath) => {
  if (!filePath) return;

  try {
    await fs.unlink(filePath);
  } catch (error) {
    console.error('Failed to delete upload:', error.message);
  }
};

const createFlashcardSet = async ({ req, res, transcriptResult, sourceType, sourceName, videoUrl = null }) => {
  const numCards = req.body?.numCards ?? 10;

  const flashcardResult = await generateFlashcards(transcriptResult.fullText, numCards);
  if (!flashcardResult.success) {
    return res.status(500).json({
      success: false,
      message: flashcardResult.error || 'Failed to generate flashcards'
    });
  }

  const title = sourceType === 'video_upload'
    ? await generateTitleFromText(transcriptResult.fullText, sourceName || 'Uploaded Video')
    : await generateTitle(transcriptResult.fullText);

  const flashcardSet = await FlashcardSet.create({
    user: req.user.id,
    title,
    videoUrl,
    videoId: transcriptResult.videoId ?? null,
    thumbnail: transcriptResult.thumbnail ?? null,
    sourceType,
    sourceName,
    cards: flashcardResult.cards
  });

  return res.status(201).json({
    success: true,
    flashcardSet: {
      id: flashcardSet._id,
      title: flashcardSet.title,
      videoUrl: flashcardSet.videoUrl,
      videoId: flashcardSet.videoId,
      thumbnail: flashcardSet.thumbnail,
      sourceType: flashcardSet.sourceType,
      sourceName: flashcardSet.sourceName,
      cardCount: flashcardSet.cards.length,
      cards: flashcardSet.cards
    }
  });
};

export const generateFlashcardsFromYouTube = async (req, res, next) => {
  try {
    const { videoUrl, numCards = 10 } = req.body;

    if (!videoUrl) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a YouTube URL'
      });
    }

    const transcriptResult = await fetchYouTubeTranscript(videoUrl);

    if (!transcriptResult.success) {
      return res.status(400).json({
        success: false,
        message: transcriptResult.error || 'Failed to fetch transcript'
      });
    }

    const numCardsValue = Number.parseInt(numCards, 10);
    req.body.numCards = Number.isFinite(numCardsValue) ? numCardsValue : 10;

    return await createFlashcardSet({
      req,
      res,
      transcriptResult,
      sourceType: 'youtube',
      sourceName: null,
      videoUrl
    });
  } catch (error) {
    next(error);
  }
};

export const generateFlashcardsFromUpload = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a video file'
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

    return await createFlashcardSet({
      req,
      res,
      transcriptResult,
      sourceType: 'video_upload',
      sourceName: req.file.originalname,
      videoUrl: null
    });
  } catch (error) {
    next(error);
  } finally {
    await cleanupFile(req.file?.path);
  }
};

export const generateFlashcardsFromVideo = async (req, res, next) => {
  if (req.file) {
    return generateFlashcardsFromUpload(req, res, next);
  }

  return generateFlashcardsFromYouTube(req, res, next);
};

export const getFlashcardSets = async (req, res, next) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const flashcardSets = await FlashcardSet.aggregate([
      { $match: { user: userId } },
      {
        $project: {
          _id: 1,
          title: 1,
          videoUrl: 1,
          videoId: 1,
          thumbnail: 1,
          sourceType: 1,
          sourceName: 1,
          createdAt: 1,
          cardCount: { $size: '$cards' }
        }
      },
      { $sort: { createdAt: -1 } }
    ]);

    res.json({
      success: true,
      count: flashcardSets.length,
      flashcardSets
    });
  } catch (error) {
    next(error);
  }
};

export const getFlashcardSet = async (req, res, next) => {
  try {
    const flashcardSet = await FlashcardSet.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!flashcardSet) {
      return res.status(404).json({
        success: false,
        message: 'Flashcard set not found'
      });
    }

    res.json({
      success: true,
      flashcardSet
    });
  } catch (error) {
    next(error);
  }
};

export const deleteFlashcardSet = async (req, res, next) => {
  try {
    const flashcardSet = await FlashcardSet.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!flashcardSet) {
      return res.status(404).json({
        success: false,
        message: 'Flashcard set not found'
      });
    }

    await FlashcardSet.deleteOne({ _id: req.params.id });

    res.json({
      success: true,
      message: 'Flashcard set deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
