import { User, Quiz, FlashcardSet, Score } from '../models/index.js';

export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    const quizCount = await Quiz.countDocuments({ user: req.user.id });
    const flashcardSetCount = await FlashcardSet.countDocuments({ user: req.user.id });
    const scores = await Score.find({ user: req.user.id });

    const totalQuizzesTaken = scores.length;
    const averageScore = scores.length > 0
      ? Math.round(scores.reduce((acc, s) => acc + s.percentage, 0) / scores.length)
      : 0;

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        createdAt: user.createdAt
      },
      stats: {
        quizCount,
        flashcardSetCount,
        totalQuizzesTaken,
        averageScore
      }
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Name is required'
      });
    }

    const user = await User.findById(req.user.id);

    user.name = name.trim();
    await user.save();

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getScoreHistory = async (req, res, next) => {
  try {
    const scores = await Score.find({ user: req.user.id })
      .populate('quiz', 'title thumbnail videoId')
      .sort('-completedAt');

    res.json({
      success: true,
      count: scores.length,
      scores
    });
  } catch (error) {
    next(error);
  }
};

export const getScoreDetails = async (req, res, next) => {
  try {
    const score = await Score.findOne({
      _id: req.params.id,
      user: req.user.id
    }).populate('quiz');

    if (!score) {
      return res.status(404).json({
        success: false,
        message: 'Score not found'
      });
    }

    if (!score.quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz has been deleted'
      });
    }

    // Build results with full question details
    const results = score.quiz.questions.map((question, index) => {
      const answer = score.answers.find(a => a.questionIndex === index) || {};
      return {
        question: question.question,
        type: question.type,
        options: question.options,
        userAnswer: answer.userAnswer || '',
        correctAnswer: question.correctAnswer,
        isCorrect: answer.isCorrect || false,
        explanation: question.explanation
      };
    });

    res.json({
      success: true,
      score: {
        id: score._id,
        correctAnswers: score.correctAnswers,
        totalQuestions: score.totalQuestions,
        percentage: score.percentage,
        timeTaken: score.timeTaken,
        completedAt: score.completedAt
      },
      quiz: {
        id: score.quiz._id,
        title: score.quiz.title,
        thumbnail: score.quiz.thumbnail
      },
      results
    });
  } catch (error) {
    next(error);
  }
};

export const getDashboard = async (req, res, next) => {
  try {
    const recentQuizzes = await Quiz.find({ user: req.user.id })
      .select('title thumbnail videoId difficulty sourceType createdAt')
      .sort('-createdAt')
      .limit(5);

    const recentScores = await Score.find({ user: req.user.id })
      .populate('quiz', 'title thumbnail')
      .sort('-completedAt')
      .limit(5);

    const quizCount = await Quiz.countDocuments({ user: req.user.id });

    // Use aggregation for flashcard count
    const flashcardSetCount = await FlashcardSet.countDocuments({ user: req.user.id });

    const scores = await Score.find({ user: req.user.id });

    const totalQuizzesTaken = scores.length;
    const averageScore = scores.length > 0
      ? Math.round(scores.reduce((acc, s) => acc + s.percentage, 0) / scores.length)
      : 0;

    res.json({
      success: true,
      stats: {
        quizCount,
        flashcardSetCount,
        totalQuizzesTaken,
        averageScore
      },
      recentQuizzes,
      recentScores
    });
  } catch (error) {
    next(error);
  }
};
