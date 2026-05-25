import mongoose from 'mongoose';

const cardSchema = new mongoose.Schema({
  front: {
    type: String,
    required: true
  },
  back: {
    type: String,
    required: true
  },
  timestamp: {
    type: Number,
    default: 0
  }
});

const flashcardSetSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  videoUrl: {
    type: String,
    required: true
  },
  videoId: {
    type: String,
    required: true
  },
  thumbnail: {
    type: String,
    default: null
  },
  cards: [cardSchema]
}, {
  timestamps: true
});

flashcardSetSchema.virtual('cardCount').get(function() {
  return this.cards ? this.cards.length : 0;
});

flashcardSetSchema.set('toJSON', { virtuals: true });
flashcardSetSchema.set('toObject', { virtuals: true });

export default mongoose.model('FlashcardSet', flashcardSetSchema);
