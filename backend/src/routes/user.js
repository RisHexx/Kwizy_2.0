import express from 'express';
import {
  getProfile,
  updateProfile,
  getScoreHistory,
  getScoreDetails,
  getDashboard
} from '../controllers/userController.js';
import { protect } from '../middleware/index.js';

const router = express.Router();

router.use(protect);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.get('/scores', getScoreHistory);
router.get('/scores/:id', getScoreDetails);
router.get('/dashboard', getDashboard);

export default router;
