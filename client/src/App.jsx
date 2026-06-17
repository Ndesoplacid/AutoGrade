import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CreateExam from './pages/CreateExam';
import TakeExam from './pages/TakeExam';
import ResultDetail from './pages/ResultDetail';
import ExamSubmissions from './pages/ExamSubmissions';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
          <Navbar />
          <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-8">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/exams/create"
                element={
                  <ProtectedRoute allowedRole="teacher">
                    <CreateExam />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/exams/take/:id"
                element={
                  <ProtectedRoute allowedRole="student">
                    <TakeExam />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/exams/:id/submissions"
                element={
                  <ProtectedRoute allowedRole="teacher">
                    <ExamSubmissions />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/submissions/:id"
                element={
                  <ProtectedRoute>
                    <ResultDetail />
                  </ProtectedRoute>
                }
              />

              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
