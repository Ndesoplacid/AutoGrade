import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['teacher', 'student'], default: 'student' },
  studentId: { type: String, required: function() { return this.role === 'student'; } },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('User', userSchema);
