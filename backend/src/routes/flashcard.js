import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import {
  generateFlashcardsFromVideo,
  getFlashcardSets,
  getFlashcardSet,
  deleteFlashcardSet
} from '../controllers/flashcardController.js';
import { protect } from '../middleware/index.js';

const router = express.Router();

router.use(protect);

const uploadRoot = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadRoot)) {
  fs.mkdirSync(uploadRoot, { recursive: true });
}

const storage = multer.diskStorage({
  destination: uploadRoot,
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    const uniqueSuffix = `${Date.now()}_${Math.round(Math.random() * 1e9)}`;
    cb(null, `${uniqueSuffix}_${safeName}`);
  }
});

const videoUpload = multer({
  storage,
  limits: { fileSize: 250 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const isVideo = file.mimetype?.startsWith('video/');
    if (!isVideo) {
      return cb(new Error('Only video files are allowed'));
    }
    return cb(null, true);
  }
}).single('file');

router.post('/generate', videoUpload, generateFlashcardsFromVideo);
router.get('/', getFlashcardSets);
router.get('/:id', getFlashcardSet);
router.delete('/:id', deleteFlashcardSet);

export default router;
