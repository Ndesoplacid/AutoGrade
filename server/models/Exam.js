import mongoose from 'mongoose';

const answerKeySchema = new mongoose.Schema({
  questionNumber: { type: Number, required: true },
  correctOption: { type: String, required: true, enum: ['A', 'B', 'C', 'D'] }
}, { _id: false });

const examSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  subject: { type: String, required: true, trim: true },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  totalQuestions: { type: Number, required: true },
  marksPerQuestion: { type: Number, default: 1 },
  answerKey: [answerKeySchema],
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Exam', examSchema);
