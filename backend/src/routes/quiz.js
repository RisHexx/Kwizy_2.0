import express from 'express';
import {
  generateQuizFromVideo,
  getQuizzes,
  getQuiz,
  submitQuiz,
  deleteQuiz
} from '../controllers/quizController.js';
import { protect } from '../middleware/index.js';

const router = express.Router();

router.use(protect);

router.post('/generate', generateQuizFromVideo);
router.get('/', getQuizzes);
router.get('/:id', getQuiz);
router.post('/:id/submit', submitQuiz);
router.delete('/:id', deleteQuiz);

export default router;
