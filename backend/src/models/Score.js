import mongoose from 'mongoose';

const answerSchema = new mongoose.Schema({
  questionIndex: {
    type: Number,
    required: true
  },
  userAnswer: {
    type: String,
    default: ''
  },
  correctAnswer: {
    type: String,
    required: true
  },
  isCorrect: {
    type: Boolean,
    required: true
  },
  timestamp: {
    type: Number,
    default: null
  }
});

const scoreSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  quiz: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true
  },
  answers: [answerSchema],
  correctAnswers: {
    type: Number,
    required: true
  },
  totalQuestions: {
    type: Number,
    required: true
  },
  percentage: {
    type: Number,
    required: true
  },
  timeTaken: {
    type: Number,
    default: null
  },
  completedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

scoreSchema.pre('save', function(next) {
  this.percentage = Math.round((this.correctAnswers / this.totalQuestions) * 100);
  next();
});

export default mongoose.model('Score', scoreSchema);
