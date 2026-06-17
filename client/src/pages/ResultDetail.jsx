import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Check, X, Award, Clock, Printer } from 'lucide-react';

const ResultDetail = () => {
  const { id } = useParams();
  const { token, API_URL } = useAuth();
  const navigate = useNavigate();

  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSubmission = async () => {
      try {
        const res = await fetch(`${API_URL}/submissions/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!res.ok) throw new Error('Failed to load submission details.');
        const data = await res.json();
        setSubmission(data);
      } catch (err) {
        console.error(err);
        setError(err.message || 'An error occurred.');
      } finally {
        setLoading(false);
      }
    };

    fetchSubmission();
  }, [id, token, API_URL]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-400 font-medium">Calculating grades...</p>
      </div>
    );
  }

  if (error || !submission) {
    return (
      <div className="p-4 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-sm max-w-lg mx-auto mt-8">
        {error || 'Submission details unavailable'}
      </div>
    );
  }

  const { exam, student, totalScore, percentage, grade, answers, submittedAt } = submission;
  const totalQuestions = exam.totalQuestions;
  const marksPerQuestion = exam.marksPerQuestion;
  const maxScore = totalQuestions * marksPerQuestion;

  const correctAnswersCount = answers.filter((a) => a.isCorrect).length;
  const unansweredCount = answers.filter((a) => !a.selectedOption).length;
  const incorrectAnswersCount = totalQuestions - correctAnswersCount - unansweredCount;

  const correctOptionMap = new Map(
    exam.answerKey ? exam.answerKey.map(ak => [ak.questionNumber, ak.correctOption]) : []
  );

  const handlePrint = () => {
    window.print();
  };

  const getFeedbackMessage = (pct) => {
    if (pct >= 90) return { title: 'Excellent Work!', desc: 'You have demonstrated a mastery of this subject.' };
    if (pct >= 80) return { title: 'Great Job!', desc: 'Solid performance. Keep up the high standards.' };
    if (pct >= 70) return { title: 'Good Effort!', desc: 'Decent performance. A bit more review will get you higher.' };
    if (pct >= 60) return { title: 'Passed', desc: 'You passed the exam, but consider reviewing weak areas.' };
    return { title: 'Needs Improvement', desc: 'We recommend reviewing the material and trying again.' };
  };

  const feedback = getFeedbackMessage(percentage);

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fadeIn print:m-0 print:p-0">
      <div className="flex items-center justify-between print:hidden">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center space-x-2 text-slate-400 hover:text-white transition text-sm font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>
        <button
          onClick={handlePrint}
          className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-4 py-2 rounded-xl border border-slate-700 transition text-sm font-semibold"
        >
          <Printer className="w-4 h-4" />
          <span>Print / PDF Report</span>
        </button>
      </div>

      <div className="glassmorphism p-6 rounded-2xl flex flex-col md:flex-row justify-between gap-6 print:border print:border-black print:text-black print:bg-white print:rounded-none">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20 print:border-black print:text-black">
            {exam.subject}
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white mt-3 print:text-black leading-tight">
            Grading Report: {exam.title}
          </h1>
          <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4 text-xs text-slate-400 print:text-black">
            <span className="flex items-center space-x-1.5">
              <Award className="w-4 h-4 text-slate-500 print:text-black" />
              <span>Student: <strong className="text-slate-300 print:text-black font-semibold">{student.name} ({student.studentId})</strong></span>
            </span>
            <span className="flex items-center space-x-1.5">
              <Clock className="w-4 h-4 text-slate-500 print:text-black" />
              <span>Submitted: <strong className="text-slate-300 print:text-black font-semibold">{new Date(submittedAt).toLocaleString()}</strong></span>
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-4 shrink-0 bg-slate-800/40 border border-slate-700/60 p-4 rounded-2xl print:border-black print:text-black">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl font-black ${
            grade === 'F' ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'
          } print:border print:border-black print:text-black`}>
            {grade}
          </div>
          <div>
            <div className="text-2xl font-black text-white print:text-black">{totalScore} / {maxScore}</div>
            <div className="text-xs text-slate-400 print:text-black uppercase font-bold tracking-wider mt-0.5">{percentage}% Score</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glassmorphism p-5 rounded-2xl grid grid-cols-3 md:col-span-2 gap-4 text-center print:border print:border-black print:text-black">
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/10 rounded-xl">
            <div className="text-xl font-black text-emerald-400 print:text-black">{correctAnswersCount}</div>
            <div className="text-[10px] text-slate-400 print:text-black font-bold uppercase tracking-wider mt-1">Correct</div>
          </div>
          <div className="p-3 bg-rose-500/10 border border-rose-500/10 rounded-xl">
            <div className="text-xl font-black text-rose-400 print:text-black">{incorrectAnswersCount}</div>
            <div className="text-[10px] text-slate-400 print:text-black font-bold uppercase tracking-wider mt-1">Wrong</div>
          </div>
          <div className="p-3 bg-slate-800/60 border border-slate-700/50 rounded-xl">
            <div className="text-xl font-black text-slate-300 print:text-black">{unansweredCount}</div>
            <div className="text-[10px] text-slate-400 print:text-black font-bold uppercase tracking-wider mt-1">Skipped</div>
          </div>
        </div>

        <div className="glassmorphism p-5 rounded-2xl flex flex-col justify-center border-l-4 border-l-indigo-500 print:border print:border-black print:text-black">
          <h3 className="font-bold text-white print:text-black text-base">{feedback.title}</h3>
          <p className="text-xs text-slate-400 print:text-black mt-1 leading-relaxed">{feedback.desc}</p>
        </div>
      </div>

      <div className="glassmorphism p-6 md:p-8 rounded-2xl space-y-6 print:border print:border-black print:text-black">
        <h2 className="text-lg font-bold text-white print:text-black border-b border-slate-800 pb-3 flex items-center space-x-2">
          <span>Question-by-Question Evaluation</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {answers.map((ans) => {
            const correctAnswer = correctOptionMap.get(ans.questionNumber);
            return (
              <div
                key={ans.questionNumber}
                className={`p-4 rounded-xl border flex items-center justify-between gap-4 transition duration-150 ${
                  ans.isCorrect
                    ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-300 print:bg-white print:text-black print:border-black'
                    : 'bg-rose-500/10 border-rose-500/25 text-rose-300 print:bg-white print:text-black print:border-black'
                }`}
              >
                <div>
                  <div className="text-xs font-semibold text-slate-400 print:text-black">Question {ans.questionNumber}</div>
                  <div className="text-sm font-bold mt-1 text-white print:text-black">
                    Your Answer: <span className="font-black text-lg">{ans.selectedOption || 'N/A'}</span>
                  </div>
                  {correctAnswer && (
                    <div className="text-xs text-slate-400 print:text-black mt-1">
                      Correct Key: <strong className="text-slate-200 print:text-black">{correctAnswer}</strong>
                    </div>
                  )}
                </div>

                <div className={`p-2 rounded-lg ${
                  ans.isCorrect ? 'bg-emerald-500/25 text-emerald-400' : 'bg-rose-500/25 text-rose-400'
                } print:border print:border-black print:text-black shrink-0`}>
                  {ans.isCorrect ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ResultDetail;
