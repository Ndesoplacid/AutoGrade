import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Users, ClipboardCheck, Percent, FileDown, PlusCircle, ChevronRight, CheckCircle2 } from 'lucide-react';

const Dashboard = () => {
  const { user, token, API_URL } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const roleEndpoint = user.role === 'teacher' ? 'teacher/stats' : 'student/stats';
        const res = await fetch(`${API_URL}/submissions/${roleEndpoint}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!res.ok) {
          throw new Error('Failed to fetch dashboard statistics.');
        }
        const stats = await res.json();
        setData(stats);
      } catch (err) {
        console.error(err);
        setError(err.message || 'An error occurred.');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user.role, token, API_URL]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-400 font-medium">Fetching dashboard info...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-sm max-w-lg mx-auto mt-8">
        {error}
      </div>
    );
  }

  const handleDownloadCSV = (examId, examTitle) => {
    fetch(`${API_URL}/submissions/exam/${examId}/download-csv`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => {
        if (!res.ok) throw new Error('Download failed');
        return res.blob();
      })
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${examTitle.replace(/\s+/g, '_')}_grades.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      })
      .catch(err => alert(err.message));
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="glassmorphism p-6 rounded-2xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Hello, <span className="gradient-text">{user.name}</span>!
          </h1>
          <p className="text-slate-400 mt-1 text-sm md:text-base">
            {user.role === 'teacher'
              ? 'Here is an overview of exams you have created and student performance.'
              : 'Assess your performance, view completed exams, or start a new attempt.'}
          </p>
        </div>
        {user.role === 'teacher' && (
          <Link
            to="/exams/create"
            className="inline-flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-semibold transition duration-150 shadow-lg shadow-indigo-600/25 shrink-0"
          >
            <PlusCircle className="w-5 h-5" />
            <span>Create Exam</span>
          </Link>
        )}
      </div>

      {user.role === 'teacher' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glassmorphism p-6 rounded-2xl flex items-center space-x-4 border-l-4 border-l-indigo-500">
            <div className="p-3.5 bg-indigo-600/20 text-indigo-400 rounded-xl">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-white">{data?.totalExams}</div>
              <div className="text-xs uppercase tracking-wider font-semibold text-slate-400">Total Exams</div>
            </div>
          </div>

          <div className="glassmorphism p-6 rounded-2xl flex items-center space-x-4 border-l-4 border-l-purple-500">
            <div className="p-3.5 bg-purple-600/20 text-purple-400 rounded-xl">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-white">{data?.totalSubmissions}</div>
              <div className="text-xs uppercase tracking-wider font-semibold text-slate-400">Student Submissions</div>
            </div>
          </div>

          <div className="glassmorphism p-6 rounded-2xl flex items-center space-x-4 border-l-4 border-l-emerald-500">
            <div className="p-3.5 bg-emerald-600/20 text-emerald-400 rounded-xl">
              <Percent className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-white">{data?.avgPercentage}%</div>
              <div className="text-xs uppercase tracking-wider font-semibold text-slate-400">Average Score</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glassmorphism p-6 rounded-2xl flex items-center space-x-4 border-l-4 border-l-indigo-500">
            <div className="p-3.5 bg-indigo-600/20 text-indigo-400 rounded-xl">
              <ClipboardCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-white">{data?.totalSubmissions}</div>
              <div className="text-xs uppercase tracking-wider font-semibold text-slate-400">Exams Completed</div>
            </div>
          </div>

          <div className="glassmorphism p-6 rounded-2xl flex items-center space-x-4 border-l-4 border-l-purple-500">
            <div className="p-3.5 bg-purple-600/20 text-purple-400 rounded-xl">
              <Percent className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-white">{data?.avgPercentage}%</div>
              <div className="text-xs uppercase tracking-wider font-semibold text-slate-400">Average Percentage</div>
            </div>
          </div>

          <div className="glassmorphism p-6 rounded-2xl flex items-center space-x-4 border-l-4 border-l-emerald-500">
            <div className="p-3.5 bg-emerald-600/20 text-emerald-400 rounded-xl">
              <Percent className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-white">{data?.highestScore}%</div>
              <div className="text-xs uppercase tracking-wider font-semibold text-slate-400">Highest Score</div>
            </div>
          </div>
        </div>
      )}

      {user.role === 'teacher' ? (
        <div className="glassmorphism rounded-2xl overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Your Created Exams</h2>
          </div>
          {data?.exams && data.exams.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-800/40 text-slate-400 text-xs uppercase font-semibold tracking-wider">
                    <th className="px-6 py-3.5">Exam Title</th>
                    <th className="px-6 py-3.5">Subject</th>
                    <th className="px-6 py-3.5 text-center">Questions</th>
                    <th className="px-6 py-3.5 text-center">Marks/Question</th>
                    <th className="px-6 py-3.5 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-sm">
                  {data.exams.map((exam) => (
                    <tr key={exam._id} className="hover:bg-slate-800/20 transition duration-150">
                      <td className="px-6 py-4 font-semibold text-white">{exam.title}</td>
                      <td className="px-6 py-4 text-slate-300">{exam.subject}</td>
                      <td className="px-6 py-4 text-center text-slate-300">{exam.totalQuestions}</td>
                      <td className="px-6 py-4 text-center text-slate-300">{exam.marksPerQuestion}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center space-x-3">
                          <Link
                            to={`/exams/${exam._id}/submissions`}
                            className="bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 hover:text-indigo-300 px-3 py-1.5 rounded-lg border border-indigo-500/20 transition flex items-center space-x-1"
                          >
                            <span>Submissions</span>
                            <ChevronRight className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDownloadCSV(exam._id, exam.title)}
                            className="bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white p-2 rounded-lg border border-slate-700 transition"
                            title="Download CSV Report"
                          >
                            <FileDown className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-500">
              You haven't created any exams yet. Click "Create Exam" to get started!
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="glassmorphism rounded-2xl p-6 space-y-4">
            <h2 className="text-xl font-bold text-white border-b border-slate-800 pb-3">Available Exams</h2>
            {data?.availableExams && data.availableExams.length > 0 ? (
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
                {data.availableExams.map((exam) => {
                  const submission = data.submissions.find((s) => s.exam._id === exam._id);
                  return (
                    <div key={exam._id} className="p-4 bg-slate-800/40 hover:bg-slate-800/60 border border-slate-700/60 rounded-xl flex items-center justify-between gap-4 transition">
                      <div>
                        <h3 className="font-bold text-white text-base leading-snug">{exam.title}</h3>
                        <p className="text-xs text-slate-400 mt-0.5">{exam.subject} • {exam.totalQuestions} Questions</p>
                        <p className="text-[10px] text-indigo-400 mt-1 uppercase font-semibold">Teacher: {exam.teacher?.name}</p>
                      </div>
                      {submission ? (
                        <div className="text-right shrink-0">
                          <Link
                            to={`/submissions/${submission._id}`}
                            className="inline-flex items-center space-x-1 bg-emerald-600/10 text-emerald-400 hover:text-emerald-300 px-3 py-1.5 rounded-lg border border-emerald-500/20 text-xs font-semibold"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Graded: {submission.grade} ({submission.percentage}%)</span>
                          </Link>
                        </div>
                      ) : (
                        <Link
                          to={`/exams/take/${exam._id}`}
                          className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-lg transition shrink-0"
                        >
                          Take Exam
                        </Link>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-slate-500 text-center py-6">No exams available at this time.</div>
            )}
          </div>

          <div className="glassmorphism rounded-2xl p-6 space-y-4">
            <h2 className="text-xl font-bold text-white border-b border-slate-800 pb-3">Your Graded History</h2>
            {data?.submissions && data.submissions.length > 0 ? (
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
                {data.submissions.map((sub) => (
                  <Link
                    key={sub._id}
                    to={`/submissions/${sub._id}`}
                    className="block p-4 bg-slate-800/25 hover:bg-slate-800/45 border border-slate-800 hover:border-slate-700/80 rounded-xl transition"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-white text-sm">{sub.exam?.title}</h4>
                        <span className="text-[10px] text-slate-400">{new Date(sub.submittedAt).toLocaleDateString()}</span>
                      </div>
                      <div className="text-right leading-none">
                        <span className={`text-lg font-black ${
                          sub.grade === 'F' ? 'text-rose-400' : 'text-emerald-400'
                        }`}>
                          Grade {sub.grade}
                        </span>
                        <div className="text-xs text-slate-400 mt-1">{sub.totalScore} Marks ({sub.percentage}%)</div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-slate-500 text-center py-6">You haven't submitted any exams yet.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
