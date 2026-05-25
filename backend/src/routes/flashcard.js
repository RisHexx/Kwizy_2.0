import express from 'express';
import {
  generateFlashcardsFromVideo,
  getFlashcardSets,
  getFlashcardSet,
  deleteFlashcardSet
} from '../controllers/flashcardController.js';
import { protect } from '../middleware/index.js';

const router = express.Router();

router.use(protect);

router.post('/generate', generateFlashcardsFromVideo);
router.get('/', getFlashcardSets);
router.get('/:id', getFlashcardSet);
router.delete('/:id', deleteFlashcardSet);

export default router;
