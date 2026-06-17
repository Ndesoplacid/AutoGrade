import mongoose from 'mongoose';

const studentAnswerSchema = new mongoose.Schema({
  questionNumber: { type: Number, required: true },
  selectedOption: { type: String, default: '' }, // empty if unanswered
  isCorrect: { type: Boolean, required: true }
}, { _id: false });

const submissionSchema = new mongoose.Schema({
  exam: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  totalScore: { type: Number, required: true },
  percentage: { type: Number, required: true },
  grade: { type: String, required: true },
  answers: [studentAnswerSchema],
  submittedAt: { type: Date, default: Date.now }
});

export default mongoose.model('Submission', submissionSchema);
