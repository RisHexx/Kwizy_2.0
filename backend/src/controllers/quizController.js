import { Quiz, Score } from '../models/index.js';
import { fetchYouTubeTranscript, generateQuiz, generateTitle, formatTimestampLink } from '../services/index.js';

export const generateQuizFromVideo = async (req, res, next) => {
  try {
    const { videoUrl, difficulty = 'medium', numQuestions = 10 } = req.body;

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

    const quizResult = await generateQuiz(transcriptResult.fullText, difficulty, numQuestions);
    if (!quizResult.success) {
      return res.status(500).json({
        success: false,
        message: quizResult.error || 'Failed to generate quiz'
      });
    }

    const title = await generateTitle(transcriptResult.fullText);

    const quiz = await Quiz.create({
      user: req.user.id,
      title,
      videoUrl,
      videoId: transcriptResult.videoId,
      thumbnail: transcriptResult.thumbnail,
      difficulty,
      questions: quizResult.questions,
      transcript: transcriptResult.fullText
    });

    res.status(201).json({
      success: true,
      quiz: {
        id: quiz._id,
        title: quiz.title,
        videoUrl: quiz.videoUrl,
        videoId: quiz.videoId,
        thumbnail: quiz.thumbnail,
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
  }
};

export const getQuizzes = async (req, res, next) => {
  try {
    const quizzes = await Quiz.find({ user: req.user.id })
      .select('-questions -transcript')
      .sort('-createdAt');

    res.json({
      success: true,
      count: quizzes.length,
      quizzes
    });
  } catch (error) {
    next(error);
  }
};

export const getQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findOne({ _id: req.params.id, user: req.user.id });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    res.json({
      success: true,
      quiz: {
        id: quiz._id,
        title: quiz.title,
        videoUrl: quiz.videoUrl,
        videoId: quiz.videoId,
        thumbnail: quiz.thumbnail,
        difficulty: quiz.difficulty,
        questionCount: quiz.questions.length,
        questions: quiz.questions.map(q => ({
          type: q.type,
          question: q.question,
          options: q.options
        })),
        createdAt: quiz.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

export const submitQuiz = async (req, res, next) => {
  try {
    const { answers, timeTaken } = req.body;

    const quiz = await Quiz.findOne({ _id: req.params.id, user: req.user.id });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    const gradedAnswers = quiz.questions.map((question, index) => {
      const userAnswer = answers[index] || '';
      const isCorrect = userAnswer === question.correctAnswer;
      return {
        questionIndex: index,
        userAnswer,
        correctAnswer: question.correctAnswer,
        isCorrect,
        timestamp: question.timestamp
      };
    });

    const correctCount = gradedAnswers.filter(a => a.isCorrect).length;

    const score = await Score.create({
      user: req.user.id,
      quiz: quiz._id,
      answers: gradedAnswers,
      correctAnswers: correctCount,
      totalQuestions: quiz.questions.length,
      percentage: Math.round((correctCount / quiz.questions.length) * 100),
      timeTaken
    });

    const results = quiz.questions.map((question, index) => {
      const graded = gradedAnswers[index];
      return {
        question: question.question,
        type: question.type,
        options: question.options,
        userAnswer: graded.userAnswer,
        correctAnswer: question.correctAnswer,
        isCorrect: graded.isCorrect,
        explanation: question.explanation,
        timestampLink: !graded.isCorrect ? formatTimestampLink(quiz.videoId, question.timestamp) : null
      };
    });

    res.json({
      success: true,
      score: {
        id: score._id,
        correctAnswers: correctCount,
        totalQuestions: quiz.questions.length,
        percentage: score.percentage,
        timeTaken
      },
      results
    });
  } catch (error) {
    next(error);
  }
};

export const deleteQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findOne({ _id: req.params.id, user: req.user.id });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    await Quiz.deleteOne({ _id: req.params.id });
    await Score.deleteMany({ quiz: req.params.id });

    res.json({
      success: true,
      message: 'Quiz deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
