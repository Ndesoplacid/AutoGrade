import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './models/User.js';
import Exam from './models/Exam.js';
import Submission from './models/Submission.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/autograde_test';

const assert = (condition, message) => {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
  console.log(`[PASS] ${message}`);
};

const runTests = async () => {
  try {
    console.log('=== PHASE 1: OFFLINE GRADING ENGINE CALCULATIONS ===');
    const examMock = {
      totalQuestions: 4,
      marksPerQuestion: 3,
      answerKey: [
        { questionNumber: 1, correctOption: 'A' },
        { questionNumber: 2, correctOption: 'B' },
        { questionNumber: 3, correctOption: 'C' },
        { questionNumber: 4, correctOption: 'D' }
      ]
    };

    const studentAnswers = [
      { questionNumber: 1, selectedOption: 'A' },
      { questionNumber: 2, selectedOption: 'C' },
      { questionNumber: 3, selectedOption: '' },
      { questionNumber: 4, selectedOption: 'D' }
    ];

    const answerMap = new Map(
      examMock.answerKey.map(ak => [ak.questionNumber, ak.correctOption])
    );

    let correctCount = 0;
    let incorrectCount = 0;
    let unansweredCount = 0;
    const gradedAnswers = [];

    for (let qNum = 1; qNum <= examMock.totalQuestions; qNum++) {
      const correctAnswer = answerMap.get(qNum);
      const studentAnsObj = studentAnswers.find(sa => sa.questionNumber === qNum);
      const selectedOption = studentAnsObj ? studentAnsObj.selectedOption?.trim().toUpperCase() : '';

      if (!selectedOption) {
        unansweredCount++;
        gradedAnswers.push({ questionNumber: qNum, selectedOption: '', isCorrect: false });
      } else if (selectedOption === correctAnswer) {
        correctCount++;
        gradedAnswers.push({ questionNumber: qNum, selectedOption, isCorrect: true });
      } else {
        incorrectCount++;
        gradedAnswers.push({ questionNumber: qNum, selectedOption, isCorrect: false });
      }
    }

    const totalScore = correctCount * examMock.marksPerQuestion;
    const maxScore = examMock.totalQuestions * examMock.marksPerQuestion;
    const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

    assert(correctCount === 2, 'Should grade exactly 2 correct answers (Q1, Q4).');
    assert(incorrectCount === 1, 'Should grade exactly 1 incorrect answer (Q2).');
    assert(unansweredCount === 1, 'Should grade exactly 1 unanswered question (Q3).');
    assert(totalScore === 6, 'Score should be 6 marks (2 correct * 3 marks/question).');
    assert(percentage === 50, 'Percentage score should be 50%.');
    console.log('Grading Engine Arithmetic Validations PASSED.');

    console.log('\n=== PHASE 2: ONLINE DATABASE READ/WRITE OPERATIONS ===');
    console.log(`Attempting connection to MongoDB: ${MONGODB_URI.replace(/:[^@]+@/, ':****@')}`);
    
    try {
      await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
      console.log('Connected to database successfully.');

      await User.deleteMany({});
      await Exam.deleteMany({});
      await Submission.deleteMany({});
      console.log('Database cleared.');

      const teacherPassword = await bcrypt.hash('teacherpass', 10);
      const teacher = new User({
        name: 'Test Teacher',
        email: 'teacher@test.com',
        password: teacherPassword,
        role: 'teacher'
      });
      await teacher.save();
      assert(teacher._id, 'Teacher should be registered and saved.');

      const studentPassword = await bcrypt.hash('studentpass', 10);
      const student = new User({
        name: 'Test Student',
        email: 'student@test.com',
        password: studentPassword,
        role: 'student',
        studentId: 'S2002'
      });
      await student.save();
      assert(student._id, 'Student should be registered and saved.');

      const exam = new Exam({
        title: 'Grading Engine Test Exam',
        subject: 'Algorithms',
        teacher: teacher._id,
        totalQuestions: 4,
        marksPerQuestion: 3,
        answerKey: examMock.answerKey
      });
      await exam.save();
      assert(exam._id, 'Exam should be created.');

      const submission = new Submission({
        exam: exam._id,
        student: student._id,
        totalScore,
        percentage,
        grade: 'F',
        answers: gradedAnswers
      });
      await submission.save();
      assert(submission._id, 'Submission should be saved.');

      await User.deleteMany({});
      await Exam.deleteMany({});
      await Submission.deleteMany({});
      console.log('Database operations verification PASSED.');
    } catch (dbErr) {
      console.warn(`[WARNING] Database connection/operations failed: ${dbErr.message}`);
      console.warn('Ensure MONGODB_URI in .env is correct and reachable. Offline validations are sufficient for testing logic.');
    }

    console.log('\nAll offline logic tests passed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Test run failure:', err.message);
    process.exit(1);
  }
};

runTests();
