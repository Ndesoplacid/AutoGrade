import express from 'express';
import Exam from '../models/Exam.js';
import Submission from '../models/Submission.js';
import { auth, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Create Exam (Teacher only)
router.post('/', auth, requireRole('teacher'), async (req, res) => {
  try {
    const { title, subject, totalQuestions, marksPerQuestion, answerKey } = req.body;

    if (!title || !subject || !totalQuestions || !answerKey || !Array.isArray(answerKey)) {
      return res.status(400).json({ message: 'Missing required exam fields' });
    }

    if (answerKey.length !== Number(totalQuestions)) {
      return res.status(400).json({
        message: `Answer key length (${answerKey.length}) must match total questions (${totalQuestions})`
      });
    }

    const exam = new Exam({
      title,
      subject,
      teacher: req.user.id,
      totalQuestions: Number(totalQuestions),
      marksPerQuestion: Number(marksPerQuestion || 1),
      answerKey
    });

    await exam.save();
    res.status(201).json(exam);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Get all Exams
router.get('/', auth, async (req, res) => {
  try {
    let exams = await Exam.find().populate('teacher', 'name').sort({ createdAt: -1 });

    // If student, strip answerKey
    if (req.user.role === 'student') {
      exams = exams.map(exam => {
        const doc = exam.toObject();
        delete doc.answerKey;
        return doc;
      });
    }

    res.json(exams);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Get Specific Exam
router.get('/:id', auth, async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id).populate('teacher', 'name');
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    const doc = exam.toObject();
    if (req.user.role === 'student') {
      delete doc.answerKey;
    }

    res.json(doc);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Get All Submissions for a specific Exam (Teacher only)
router.get('/:id/submissions', auth, requireRole('teacher'), async (req, res) => {
  try {
    const submissions = await Submission.find({ exam: req.params.id })
      .populate('student', 'name studentId email')
      .sort({ submittedAt: -1 });
    res.json(submissions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

export default router;
