import mongoose from 'mongoose';
import { FlashcardSet } from '../models/index.js';
import { fetchYouTubeTranscript, generateFlashcards, generateTitle } from '../services/index.js';

export const generateFlashcardsFromVideo = async (req, res, next) => {
  try {
    const { videoUrl, numCards = 10 } = req.body;

    if (!videoUrl) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a video URL'
      });
    }

    const transcriptResult = await fetchYouTubeTranscript(videoUrl);
    if (!transcriptResult.success) {
      return res.status(400).json({
        success: false,
        message: transcriptResult.error || 'Failed to fetch transcript'
      });
    }

    const flashcardResult = await generateFlashcards(transcriptResult.fullText, numCards);
    if (!flashcardResult.success) {
      return res.status(500).json({
        success: false,
        message: flashcardResult.error || 'Failed to generate flashcards'
      });
    }

    const title = await generateTitle(transcriptResult.fullText);

    const flashcardSet = await FlashcardSet.create({
      user: req.user.id,
      title,
      videoUrl,
      videoId: transcriptResult.videoId,
      thumbnail: transcriptResult.thumbnail,
      cards: flashcardResult.cards
    });

    res.status(201).json({
      success: true,
      flashcardSet: {
        id: flashcardSet._id,
        title: flashcardSet.title,
        videoUrl: flashcardSet.videoUrl,
        videoId: flashcardSet.videoId,
        thumbnail: flashcardSet.thumbnail,
        cardCount: flashcardSet.cards.length,
        cards: flashcardSet.cards
      }
    });
  } catch (error) {
    next(error);
  }
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
