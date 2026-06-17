import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Send, FileSpreadsheet, List } from 'lucide-react';

const TakeExam = () => {
  const { id } = useParams();
  const { token, API_URL } = useAuth();
  const navigate = useNavigate();

  const [exam, setExam] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [file, setFile] = useState(null);
  const [submissionType, setSubmissionType] = useState('form');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchExam = async () => {
      try {
        const res = await fetch(`${API_URL}/exams/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!res.ok) throw new Error('Failed to load exam details');
        const data = await res.json();
        setExam(data);

        const initialAnswers = [];
        for (let i = 1; i <= data.totalQuestions; i++) {
          initialAnswers.push({ questionNumber: i, selectedOption: '' });
        }
        setAnswers(initialAnswers);
      } catch (err) {
        console.error(err);
        setError(err.message || 'An error occurred.');
      } finally {
        setLoading(false);
      }
    };

    fetchExam();
  }, [id, token, API_URL]);

  const handleOptionChange = (qNum, option) => {
    setAnswers((prev) =>
      prev.map((ans) =>
        ans.questionNumber === qNum ? { ...ans, selectedOption: option } : ans
      )
    );
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      let res;
      if (submissionType === 'form') {
        const unanswered = answers.filter((a) => !a.selectedOption);
        if (unanswered.length > 0) {
          const confirmSubmit = window.confirm(
            `You have ${unanswered.length} unanswered questions. Are you sure you want to submit?`
          );
          if (!confirmSubmit) {
            setSubmitting(false);
            return;
          }
        }

        res = await fetch(`${API_URL}/submissions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            examId: id,
            answers
          })
        });
      } else {
        if (!file) {
          throw new Error('Please select a CSV file to upload.');
        }

        const formData = new FormData();
        formData.append('examId', id);
        formData.append('file', file);

        res = await fetch(`${API_URL}/submissions/upload`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });
      }

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Submission failed');
      }

      navigate(`/submissions/${data._id}`);
    } catch (err) {
      console.error(err);
      setError(err.message || 'An error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-400 font-medium">Loading test sheet...</p>
      </div>
    );
  }

  if (error && !exam) {
    return (
      <div className="p-4 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-sm max-w-lg mx-auto mt-8">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fadeIn">
      <button
        onClick={() => navigate('/dashboard')}
        className="flex items-center space-x-2 text-slate-400 hover:text-white transition text-sm font-semibold"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Dashboard</span>
      </button>

      <div className="glassmorphism p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white leading-tight">{exam?.title}</h1>
          <p className="text-slate-400 text-xs mt-1">{exam?.subject} • {exam?.totalQuestions} Questions • {exam?.marksPerQuestion} Marks each</p>
        </div>

        <div className="flex bg-slate-900/60 p-1 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => setSubmissionType('form')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition ${
              submissionType === 'form'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Online Form
          </button>
          <button
            type="button"
            onClick={() => setSubmissionType('csv')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition ${
              submissionType === 'csv'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Upload CSV
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {submissionType === 'form' ? (
          <div className="glassmorphism p-6 md:p-8 rounded-2xl space-y-6">
            <h2 className="text-lg font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
              <List className="w-5 h-5 text-indigo-500" />
              <span>Select Your Answers</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {answers.map((item) => (
                <div key={item.questionNumber} className="bg-slate-800/20 border border-slate-800 p-4 rounded-xl flex items-center justify-between gap-4">
                  <span className="text-sm font-bold text-slate-300">Question {item.questionNumber}</span>
                  <div className="flex space-x-1.5 bg-slate-900/80 p-1 rounded-lg border border-slate-800">
                    {['A', 'B', 'C', 'D'].map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => handleOptionChange(item.questionNumber, opt)}
                        className={`w-7 h-7 text-xs font-black rounded-md transition ${
                          item.selectedOption === opt
                            ? 'bg-indigo-600 text-white shadow'
                            : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="glassmorphism p-8 rounded-2xl text-center space-y-6">
            <div className="max-w-md mx-auto space-y-4">
              <div className="inline-flex p-4 bg-indigo-600/20 text-indigo-400 rounded-2xl border border-indigo-500/15">
                <FileSpreadsheet className="w-10 h-10" />
              </div>
              <h2 className="text-xl font-bold text-white">Upload Answer Sheet CSV</h2>
              <p className="text-slate-400 text-xs leading-relaxed">
                Provide a CSV answer sheet with columns: <code className="bg-slate-800 text-slate-300 px-1 py-0.5 rounded font-mono">questionNumber,selectedOption</code>.<br />
                Example: <code className="bg-slate-800 text-slate-300 px-1 py-0.5 rounded font-mono">1,A \n 2,C</code>
              </p>
              <div className="pt-2">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-slate-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-slate-300 hover:file:bg-slate-700 cursor-pointer border border-slate-800 bg-slate-900/40 rounded-xl p-1.5"
                />
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 px-6 rounded-xl flex items-center space-x-2 transition disabled:opacity-50 shadow-lg shadow-indigo-600/20"
          >
            {submitting ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <span>Submit Exam</span>
                <Send className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TakeExam;
