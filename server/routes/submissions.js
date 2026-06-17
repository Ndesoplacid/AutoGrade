import express from 'express';
import multer from 'multer';
import fs from 'fs';
import csv from 'csv-parser';
import Exam from '../models/Exam.js';
import Submission from '../models/Submission.js';
import { auth, requireRole } from '../middleware/auth.js';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// Helper to determine Grade based on percentage
const calculateGrade = (percentage) => {
  if (percentage >= 90) return 'A';
  if (percentage >= 80) return 'B';
  if (percentage >= 70) return 'C';
  if (percentage >= 60) return 'D';
  return 'F';
};

// Helper for Grading Engine
const gradeExam = (exam, studentAnswers) => {
  const answerMap = new Map(
    exam.answerKey.map(ak => [ak.questionNumber, ak.correctOption])
  );

  let correctCount = 0;
  let incorrectCount = 0;
  let unansweredCount = 0;
  const gradedAnswers = [];

  for (let qNum = 1; qNum <= exam.totalQuestions; qNum++) {
    const correctAnswer = answerMap.get(qNum);
    const studentAnsObj = studentAnswers.find(sa => sa.questionNumber === qNum);
    const selectedOption = studentAnsObj ? studentAnsObj.selectedOption?.trim().toUpperCase() : '';

    if (!selectedOption) {
      unansweredCount++;
      gradedAnswers.push({
        questionNumber: qNum,
        selectedOption: '',
        isCorrect: false
      });
    } else if (selectedOption === correctAnswer) {
      correctCount++;
      gradedAnswers.push({
        questionNumber: qNum,
        selectedOption,
        isCorrect: true
      });
    } else {
      incorrectCount++;
      gradedAnswers.push({
        questionNumber: qNum,
        selectedOption,
        isCorrect: false
      });
    }
  }

  const totalScore = correctCount * exam.marksPerQuestion;
  const maxScore = exam.totalQuestions * exam.marksPerQuestion;
  const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
  const grade = calculateGrade(percentage);

  return {
    totalScore,
    percentage,
    grade,
    answers: gradedAnswers
  };
};

// Submit via Form (Student only)
router.post('/', auth, requireRole('student'), async (req, res) => {
  try {
    const { examId, answers } = req.body; // answers: [{ questionNumber, selectedOption }]

    if (!examId || !answers || !Array.isArray(answers)) {
      return res.status(400).json({ message: 'Missing examId or answers array' });
    }

    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    const gradingResult = gradeExam(exam, answers);

    const submission = new Submission({
      exam: examId,
      student: req.user.id,
      totalScore: gradingResult.totalScore,
      percentage: gradingResult.percentage,
      grade: gradingResult.grade,
      answers: gradingResult.answers
    });

    await submission.save();

    // Populate exam details for instant response
    const populated = await Submission.findById(submission._id)
      .populate('exam', 'title subject totalQuestions marksPerQuestion')
      .populate('student', 'name studentId');

    res.status(201).json(populated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Submit via CSV Upload (Student only)
router.post('/upload', auth, requireRole('student'), upload.single('file'), async (req, res) => {
  try {
    const { examId } = req.body;
    if (!examId) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(400).json({ message: 'Missing examId' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const exam = await Exam.findById(examId);
    if (!exam) {
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ message: 'Exam not found' });
    }

    const answers = [];
    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on('data', (row) => {
        const keys = Object.keys(row);
        const qNumKey = keys.find(k => k.toLowerCase().includes('question') || k.toLowerCase().includes('num') || k.toLowerCase() === 'q');
        const optKey = keys.find(k => k.toLowerCase().includes('option') || k.toLowerCase().includes('ans') || k.toLowerCase() === 'selected');

        const qNumVal = parseInt(row[qNumKey || keys[0]], 10);
        const optVal = row[optKey || keys[1]]?.trim().toUpperCase();

        if (!isNaN(qNumVal)) {
          answers.push({
            questionNumber: qNumVal,
            selectedOption: optVal || ''
          });
        }
      })
      .on('end', async () => {
        try {
          if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);

          const gradingResult = gradeExam(exam, answers);

          const submission = new Submission({
            exam: examId,
            student: req.user.id,
            totalScore: gradingResult.totalScore,
            percentage: gradingResult.percentage,
            grade: gradingResult.grade,
            answers: gradingResult.answers
          });

          await submission.save();

          const populated = await Submission.findById(submission._id)
            .populate('exam', 'title subject totalQuestions marksPerQuestion')
            .populate('student', 'name studentId');

          res.status(201).json(populated);
        } catch (err) {
          console.error(err);
          res.status(500).json({ message: 'Failed to complete grading from CSV' });
        }
      })
      .on('error', (err) => {
        console.error(err);
        if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        res.status(400).json({ message: 'Error parsing CSV file' });
      });
  } catch (err) {
    console.error(err);
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// GET /api/submissions/teacher/stats
router.get('/teacher/stats', auth, requireRole('teacher'), async (req, res) => {
  try {
    const exams = await Exam.find({ teacher: req.user.id }).sort({ createdAt: -1 });
    const examIds = exams.map(e => e._id);
    const submissions = await Submission.find({ exam: { $in: examIds } });

    const totalExams = exams.length;
    const totalSubmissions = submissions.length;
    const avgPercentage = totalSubmissions > 0
      ? Math.round(submissions.reduce((acc, s) => acc + s.percentage, 0) / totalSubmissions)
      : 0;

    res.json({ totalExams, totalSubmissions, avgPercentage, exams });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// GET /api/submissions/student/stats
router.get('/student/stats', auth, requireRole('student'), async (req, res) => {
  try {
    const submissions = await Submission.find({ student: req.user.id })
      .populate({
        path: 'exam',
        populate: { path: 'teacher', select: 'name' }
      })
      .sort({ submittedAt: -1 });

    const availableExams = await Exam.find()
      .populate('teacher', 'name')
      .sort({ createdAt: -1 });

    const totalSubmissions = submissions.length;
    const avgPercentage = totalSubmissions > 0
      ? Math.round(submissions.reduce((acc, s) => acc + s.percentage, 0) / totalSubmissions)
      : 0;

    const highestScore = totalSubmissions > 0
      ? Math.max(...submissions.map(s => s.percentage))
      : 0;

    res.json({ totalSubmissions, avgPercentage, highestScore, submissions, availableExams });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Student history
router.get('/my-history', auth, requireRole('student'), async (req, res) => {
  try {
    const submissions = await Submission.find({ student: req.user.id })
      .populate({
        path: 'exam',
        populate: { path: 'teacher', select: 'name' }
      })
      .sort({ submittedAt: -1 });
    res.json(submissions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Specific submission details (Student or Teacher)
router.get('/:id', auth, async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id)
      .populate({
        path: 'exam',
        populate: { path: 'teacher', select: 'name' }
      })
      .populate('student', 'name studentId email');

    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    if (req.user.role === 'student' && submission.student._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied: can only view own submissions' });
    }

    const examDetails = await Exam.findById(submission.exam._id);
    const submissionObj = submission.toObject();
    submissionObj.exam.answerKey = examDetails.answerKey;

    res.json(submissionObj);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Download grades for an exam as CSV (Teacher only)
router.get('/exam/:examId/download-csv', auth, requireRole('teacher'), async (req, res) => {
  try {
    const { examId } = req.params;
    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    const submissions = await Submission.find({ exam: examId })
      .populate('student', 'name studentId email')
      .sort({ totalScore: -1 });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="exam_${examId}_grades.csv"`);

    let csvContent = 'Student Name,Student ID,Email,Total Score,Percentage,Grade,Submitted At\n';
    submissions.forEach(sub => {
      csvContent += `"${sub.student.name}","${sub.student.studentId}","${sub.student.email}",${sub.totalScore},${sub.percentage},${sub.grade},"${sub.submittedAt.toISOString()}"\n`;
    });

    res.status(200).send(csvContent);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

export default router;
