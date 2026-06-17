import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, FileDown, Eye, Calendar } from 'lucide-react';

const ExamSubmissions = () => {
  const { id } = useParams();
  const { token, API_URL } = useAuth();
  const navigate = useNavigate();

  const [exam, setExam] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const examRes = await fetch(`${API_URL}/exams/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!examRes.ok) throw new Error('Failed to load exam details');
        const examData = await examRes.json();
        setExam(examData);

        const subRes = await fetch(`${API_URL}/exams/${id}/submissions`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!subRes.ok) throw new Error('Failed to load student submissions');
        const subData = await subRes.json();
        setSubmissions(subData);
      } catch (err) {
        console.error(err);
        setError(err.message || 'An error occurred.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, token, API_URL]);

  const handleDownloadCSV = () => {
    if (!exam) return;
    fetch(`${API_URL}/submissions/exam/${id}/download-csv`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then((res) => {
        if (!res.ok) throw new Error('Download failed');
        return res.blob();
      })
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${exam.title.replace(/\s+/g, '_')}_grades.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      })
      .catch((err) => alert(err.message));
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-400 font-medium">Fetching submissions list...</p>
      </div>
    );
  }

  if (error || !exam) {
    return (
      <div className="p-4 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-sm max-w-lg mx-auto mt-8">
        {error || 'Exam submissions unavailable'}
      </div>
    );
  }

  const totalSubmissions = submissions.length;
  const averagePercentage = totalSubmissions > 0
    ? Math.round(submissions.reduce((acc, s) => acc + s.percentage, 0) / totalSubmissions)
    : 0;

  const passedCount = submissions.filter((s) => s.grade !== 'F').length;

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-fadeIn">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center space-x-2 text-slate-400 hover:text-white transition text-sm font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>
        {totalSubmissions > 0 && (
          <button
            onClick={handleDownloadCSV}
            className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl font-semibold transition shadow-lg shadow-indigo-600/20 text-sm"
          >
            <FileDown className="w-4 h-4" />
            <span>Download CSV Report</span>
          </button>
        )}
      </div>

      <div className="glassmorphism p-6 rounded-2xl">
        <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20">
          {exam.subject}
        </span>
        <h1 className="text-2xl font-extrabold text-white mt-3 leading-tight">{exam.title}</h1>
        <p className="text-slate-400 text-xs mt-1">
          Teacher administration page for grading details and analytics.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="glassmorphism p-5 rounded-2xl text-center">
          <div className="text-3xl font-black text-white">{totalSubmissions}</div>
          <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mt-1">Total Submissions</div>
        </div>
        <div className="glassmorphism p-5 rounded-2xl text-center">
          <div className="text-3xl font-black text-indigo-400">{averagePercentage}%</div>
          <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mt-1">Class Average</div>
        </div>
        <div className="glassmorphism p-5 rounded-2xl text-center">
          <div className="text-3xl font-black text-emerald-400">{passedCount}</div>
          <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mt-1">Passed (A-D)</div>
        </div>
      </div>

      <div className="glassmorphism rounded-2xl overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-800">
          <h2 className="text-xl font-bold text-white">Student Submissions</h2>
        </div>

        {submissions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-800/40 text-slate-400 text-xs uppercase font-semibold tracking-wider">
                  <th className="px-6 py-3.5">Student Name</th>
                  <th className="px-6 py-3.5">Student ID</th>
                  <th className="px-6 py-3.5">Email</th>
                  <th className="px-6 py-3.5 text-center">Score</th>
                  <th className="px-6 py-3.5 text-center">Percentage</th>
                  <th className="px-6 py-3.5 text-center">Grade</th>
                  <th className="px-6 py-3.5 text-center">Submitted At</th>
                  <th className="px-6 py-3.5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-sm">
                {submissions.map((sub) => (
                  <tr key={sub._id} className="hover:bg-slate-800/20 transition duration-150">
                    <td className="px-6 py-4 font-semibold text-white">{sub.student?.name || 'N/A'}</td>
                    <td className="px-6 py-4 text-slate-300 font-mono">{sub.student?.studentId || 'N/A'}</td>
                    <td className="px-6 py-4 text-slate-400">{sub.student?.email || 'N/A'}</td>
                    <td className="px-6 py-4 text-center font-bold text-white">
                      {sub.totalScore} / {exam.totalQuestions * exam.marksPerQuestion}
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-indigo-400">{sub.percentage}%</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                        sub.grade === 'F'
                          ? 'bg-rose-500/15 text-rose-400'
                          : 'bg-emerald-500/15 text-emerald-400'
                      }`}>
                        {sub.grade}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-slate-400">
                      <span className="flex items-center justify-center space-x-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        <span>{new Date(sub.submittedAt).toLocaleDateString()}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Link
                        to={`/submissions/${sub._id}`}
                        className="inline-flex items-center space-x-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-3 py-1.5 rounded-lg border border-slate-700 transition text-xs"
                      >
                        <span>Review</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-10 text-center text-slate-500">
            No student submissions registered for this exam yet.
          </div>
        )}
      </div>
    </div>
  );
};

export default ExamSubmissions;
