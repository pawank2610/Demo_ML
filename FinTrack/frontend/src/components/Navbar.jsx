import react from  'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Landmark, LogOut, ShieldCheck, User, ArrowRightLeft, Sparkles } from 'lucide-react';

export const Navbar = () => {
  const { user, logout, quickDemoLogin, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleQuickSwitch = async (targetRole) => {
    await quickDemoLogin(targetRole);
    navigate(targetRole === 'admin' ? '/admin' : '/dashboard');
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link to={isAdmin ? '/admin' : '/dashboard'} className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <Landmark className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-extrabold tracking-tight text-white">Fin<span className="text-emerald-400">Track</span></span>
              <span className="text-[10px] font-semibold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-500/30">
                DBMS Core
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">Smart Digital Banking & Loan System</p>
          </div>
        </Link>

        {/* User Status & Fast Demo Switcher */}
        {user ? (
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Quick Persona Switcher for Evaluation */}
            <div className="hidden md:flex items-center gap-1.5 bg-slate-800/80 p-1 rounded-lg border border-slate-700/60 text-xs">
              <span className="text-slate-400 px-2 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Switch Role:
              </span>
              <button
                onClick={() => handleQuickSwitch('customer')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  !isAdmin ? 'bg-emerald-600 text-white font-medium shadow-sm' : 'text-slate-300 hover:bg-slate-700'
                }`}
              >
                Customer
              </button>
              <button
                onClick={() => handleQuickSwitch('admin')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  isAdmin ? 'bg-indigo-600 text-white font-medium shadow-sm' : 'text-slate-300 hover:bg-slate-700'
                }`}
              >
                Admin
              </button>
            </div>

            {/* User Pill */}
            <div className="flex items-center gap-2.5 bg-slate-800/50 py-1.5 px-3 rounded-full border border-slate-700">
              <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-slate-200">
                {isAdmin ? <ShieldCheck className="w-4 h-4 text-indigo-400" /> : <User className="w-4 h-4 text-emerald-400" />}
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-xs font-semibold text-slate-200 leading-none">{user.full_name}</p>
                <p className="text-[10px] text-slate-400 capitalize">{user.role}</p>
              </div>
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-xs text-slate-300 hover:text-white px-3 py-1.5">
              Sign In
            </Link>
            <Link to="/register" className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-3.5 py-1.5 rounded-lg transition-colors">
              Open Account
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

