import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Award, User } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="glassmorphism sticky top-0 z-50 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md px-4 py-3 md:px-8">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center space-x-2 text-xl font-bold tracking-tight">
          <Award className="w-7 h-7 text-indigo-500" />
          <span className="gradient-text font-extrabold">AutoGrade</span>
        </Link>

        <div className="flex items-center space-x-4">
          <div className="hidden sm:flex items-center space-x-3 bg-slate-800/60 rounded-full px-3 py-1.5 border border-slate-700">
            <User className="w-4 h-4 text-slate-400" />
            <div className="text-left leading-none">
              <div className="text-xs text-slate-400 font-semibold">{user.name}</div>
              <span className={`text-[10px] uppercase font-bold tracking-wider ${
                user.role === 'teacher' ? 'text-indigo-400' : 'text-emerald-400'
              }`}>
                {user.role} {user.studentId ? `(${user.studentId})` : ''}
              </span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-3.5 py-1.5 rounded-lg border border-slate-700 transition duration-150 text-sm font-medium"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden md:inline">Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
