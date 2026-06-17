import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './models/User.js';
import Exam from './models/Exam.js';
import Submission from './models/Submission.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/autograde';

const seed = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to database for seeding...');

    // Clear DB
    await User.deleteMany({});
    await Exam.deleteMany({});
    await Submission.deleteMany({});
    console.log('Database cleared.');

    // Create Demo Teacher
    const teacherHash = await bcrypt.hash('password123', 10);
    const teacher = new User({
      name: 'Dr. Sarah Smith',
      email: 'teacher@autograde.com',
      password: teacherHash,
      role: 'teacher'
    });
    await teacher.save();
    console.log('Demo teacher account created: teacher@autograde.com');

    // Create Demo Student
    const studentHash = await bcrypt.hash('password123', 10);
    const student = new User({
      name: 'John Doe',
      email: 'student@autograde.com',
      password: studentHash,
      role: 'student',
      studentId: 'S1001'
    });
    await student.save();
    console.log('Demo student account created: student@autograde.com');

    // Create Exam
    const exam = new Exam({
      title: 'Web Development 101 Midterm',
      subject: 'Computer Science',
      teacher: teacher._id,
      totalQuestions: 5,
      marksPerQuestion: 2,
      answerKey: [
        { questionNumber: 1, correctOption: 'A' },
        { questionNumber: 2, correctOption: 'B' },
        { questionNumber: 3, correctOption: 'C' },
        { questionNumber: 4, correctOption: 'D' },
        { questionNumber: 5, correctOption: 'A' }
      ]
    });
    await exam.save();
    console.log('Demo exam created: Web Development 101 Midterm');

    // Create Submission
    const submission = new Submission({
      exam: exam._id,
      student: student._id,
      totalScore: 8,
      percentage: 80,
      grade: 'B',
      answers: [
        { questionNumber: 1, selectedOption: 'A', isCorrect: true },
        { questionNumber: 2, selectedOption: 'B', isCorrect: true },
        { questionNumber: 3, selectedOption: 'D', isCorrect: false }, // Correct is C
        { questionNumber: 4, selectedOption: 'D', isCorrect: true },
        { questionNumber: 5, selectedOption: 'A', isCorrect: true }
      ]
    });
    await submission.save();
    console.log('Demo submission created.');

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
};

seed();
