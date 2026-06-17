import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, BookOpen, Save, FileSpreadsheet, List } from 'lucide-react';

const CreateExam = () => {
  const { token, API_URL } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [totalQuestions, setTotalQuestions] = useState(5);
  const [marksPerQuestion, setMarksPerQuestion] = useState(1);
  const [answerKey, setAnswerKey] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const qCount = Number(totalQuestions) || 0;
    if (qCount <= 0) return;

    setAnswerKey((prev) => {
      const newKey = [...prev];
      if (newKey.length < qCount) {
        for (let i = newKey.length + 1; i <= qCount; i++) {
          newKey.push({ questionNumber: i, correctOption: 'A' });
        }
      } else if (newKey.length > qCount) {
        newKey.length = qCount;
      }
      return newKey;
    });
  }, [totalQuestions]);

  const handleOptionChange = (qNum, option) => {
    setAnswerKey((prev) =>
      prev.map((item) =>
        item.questionNumber === qNum ? { ...item, correctOption: option } : item
      )
    );
  };

  const handleCSVUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target.result;
      const lines = text.split(/\r?\n/);
      const parsedKeys = [];

      lines.forEach((line) => {
        const parts = line.split(',').map((p) => p.replace(/["']/g, '').trim());
        if (parts.length >= 2) {
          const qNum = parseInt(parts[0], 10);
          const option = parts[1]?.toUpperCase();
          if (!isNaN(qNum) && ['A', 'B', 'C', 'D'].includes(option)) {
            parsedKeys.push({ questionNumber: qNum, correctOption: option });
          }
        }
      });

      if (parsedKeys.length > 0) {
        parsedKeys.sort((a, b) => a.questionNumber - b.questionNumber);
        setTotalQuestions(parsedKeys.length);
        setAnswerKey(parsedKeys);
        alert(`Successfully imported ${parsedKeys.length} answers from CSV!`);
      } else {
        alert("Error parsing CSV. Make sure it has no header and format is 'questionNumber,correctOption' (e.g., 1,B)");
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (answerKey.length !== Number(totalQuestions)) {
      setError('Answer key must match total questions.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/exams`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title,
          subject,
          totalQuestions,
          marksPerQuestion,
          answerKey
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to create exam');
      }

      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fadeIn">
      <button
        onClick={() => navigate('/dashboard')}
        className="flex items-center space-x-2 text-slate-400 hover:text-white transition text-sm font-semibold"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Dashboard</span>
      </button>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="glassmorphism p-6 md:p-8 rounded-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-indigo-500" />
                <span>Create New Exam</span>
              </h1>
              <p className="text-slate-400 text-xs mt-1">Specify test parameters and register correct MCQ answers</p>
            </div>
            <label className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-4 py-2 rounded-xl border border-slate-700 transition cursor-pointer text-sm font-semibold">
              <FileSpreadsheet className="w-4 h-4" />
              <span>Import Answer Key CSV</span>
              <input
                type="file"
                accept=".csv"
                onChange={handleCSVUpload}
                className="hidden"
              />
            </label>
          </div>

          {error && (
            <div className="p-4 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-slate-400 mb-2">Exam Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Midterm Examination"
                className="w-full bg-slate-800/50 border border-slate-700/80 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition placeholder-slate-500"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-slate-400 mb-2">Subject / Course</label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Physics"
                className="w-full bg-slate-800/50 border border-slate-700/80 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition placeholder-slate-500"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-slate-400 mb-2">Total Questions</label>
              <input
                type="number"
                min="1"
                required
                value={totalQuestions}
                onChange={(e) => setTotalQuestions(Math.max(1, parseInt(e.target.value, 10) || 0))}
                className="w-full bg-slate-800/50 border border-slate-700/80 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-slate-400 mb-2">Marks Per Question</label>
              <input
                type="number"
                min="1"
                required
                value={marksPerQuestion}
                onChange={(e) => setMarksPerQuestion(Math.max(1, parseInt(e.target.value, 10) || 0))}
                className="w-full bg-slate-800/50 border border-slate-700/80 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
            </div>
          </div>
        </div>

        <div className="glassmorphism p-6 md:p-8 rounded-2xl space-y-6">
          <h2 className="text-xl font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
            <List className="w-5 h-5 text-indigo-500" />
            <span>Answer Key Setup</span>
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {answerKey.map((item) => (
              <div key={item.questionNumber} className="bg-slate-800/30 border border-slate-800 p-3.5 rounded-xl text-center space-y-2">
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">
                  Q {item.questionNumber}
                </span>
                <div className="grid grid-cols-4 gap-1 bg-slate-900/60 p-1 rounded-lg border border-slate-800">
                  {['A', 'B', 'C', 'D'].map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => handleOptionChange(item.questionNumber, opt)}
                      className={`py-1 text-xs font-bold rounded transition ${
                        item.correctOption === opt
                          ? 'bg-indigo-600 text-white shadow'
                          : 'text-slate-500 hover:bg-slate-800/50 hover:text-slate-300'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 px-6 rounded-xl flex items-center space-x-2 transition disabled:opacity-50 shadow-lg shadow-indigo-600/20"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>Save Exam & Answer Key</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateExam;
