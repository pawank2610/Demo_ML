import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import {
  Landmark,
  ArrowRight,
  UserCheck,
  Shield,
  AlertCircle,
  KeyRound,
  Mail,
  Smartphone,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  Lock,
} from 'lucide-react';

export const Login = () => {
  const [authMethod, setAuthMethod] = useState('otp'); // 'otp' | 'password'
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  
  // OTP flow state
  const [otpSent, setOtpSent] = useState(false);
  const [receivedOtp, setReceivedOtp] = useState('');
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const { login, sendOtp, verifyOtp, quickDemoLogin } = useAuth();
  const navigate = useNavigate();

  // 1. Send OTP
  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!identifier.trim()) {
      setError('Please enter your registered email address or phone number.');
      return;
    }

    setSendingOtp(true);
    try {
      const res = await sendOtp(identifier.trim(), 'login');
      if (res.success) {
        setOtpSent(true);
        setReceivedOtp(res.otp || '');
        setSuccessMsg(`6-digit Security OTP dispatched to ${identifier}!`);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to send OTP. Check your details.');
    } finally {
      setSendingOtp(false);
    }
  };

  // 2. Verify OTP and Login
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');

    if (!otp.trim()) {
      setError('Please enter the 6-digit OTP code.');
      return;
    }

    setVerifyingOtp(true);
    try {
      const loggedUser = await verifyOtp(identifier.trim(), otp.trim(), 'login');
      navigate(loggedUser.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'OTP verification failed');
    } finally {
      setVerifyingOtp(false);
    }
  };

  // Password submission fallback
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setVerifyingOtp(true);
    try {
      const loggedUser = await login(identifier.trim(), password);
      navigate(loggedUser.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Invalid credentials');
    } finally {
      setVerifyingOtp(false);
    }
  };

  // Quick 1-click evaluation login
  const handleDemo = async (role) => {
    setError('');
    setVerifyingOtp(true);
    try {
      const demoEmail = role === 'admin' ? 'admin@fintrack.com' : 'john@example.com';
      setIdentifier(demoEmail);
      const loggedUser = await quickDemoLogin(role);
      navigate(loggedUser.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Demo login failed');
    } finally {
      setVerifyingOtp(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-indigo-600 flex items-center justify-center text-white mx-auto shadow-xl shadow-indigo-500/20">
            <Landmark className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Sign in to FinTrack</h2>
          <p className="text-xs text-slate-400">Two-Factor Authentication & Privacy Protected Banking</p>
        </div>

        {/* 1-Click Evaluation Pills */}
        <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 space-y-2.5">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block text-center">
            ⚡ 1-Click Persona Quick Login
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleDemo('customer')}
              className="flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-800 hover:bg-emerald-600/20 hover:border-emerald-500/50 border border-slate-700 rounded-xl text-xs font-medium text-emerald-400 transition-all"
            >
              <UserCheck className="w-3.5 h-3.5" /> Customer Demo
            </button>
            <button
              type="button"
              onClick={() => handleDemo('admin')}
              className="flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-800 hover:bg-indigo-600/20 hover:border-indigo-500/50 border border-slate-700 rounded-xl text-xs font-medium text-indigo-400 transition-all"
            >
              <Shield className="w-3.5 h-3.5" /> Bank Admin Demo
            </button>
          </div>
        </div>

        {/* Method Toggle: OTP vs Password */}
        <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            type="button"
            onClick={() => {
              setAuthMethod('otp');
              setError('');
            }}
            className={`flex-1 py-1.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-1.5 ${
              authMethod === 'otp' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" /> Security OTP / 2FA
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMethod('password');
              setError('');
            }}
            className={`flex-1 py-1.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-1.5 ${
              authMethod === 'password' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Lock className="w-3.5 h-3.5" /> Password Sign In
          </button>
        </div>

        {/* Feedback alerts */}
        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-2 text-xs text-rose-400 animate-fade-in">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-2 text-xs text-emerald-400 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Simulated Banking SMS / Email Notification Banner with 1-Click Auto-Fill */}
        {receivedOtp && otpSent && authMethod === 'otp' && (
          <div className="p-3.5 bg-gradient-to-r from-emerald-950/60 to-slate-900 border border-emerald-500/40 rounded-xl text-xs space-y-2 animate-fade-in">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-emerald-300 flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-emerald-400" /> Simulated Banking SMS / Email
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Valid 5 mins</span>
            </div>
            <div className="flex items-center justify-between bg-slate-950/80 p-2.5 rounded-lg border border-emerald-500/30">
              <div>
                <span className="text-[11px] text-slate-400 block">Your One-Time Passcode (OTP):</span>
                <span className="font-mono text-xl font-black text-emerald-400 tracking-widest">{receivedOtp}</span>
              </div>
              <button
                type="button"
                onClick={() => setOtp(receivedOtp)}
                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-lg transition-colors shadow-sm"
              >
                Auto-fill
              </button>
            </div>
          </div>
        )}

        {/* OTP Authentication Form */}
        {authMethod === 'otp' ? (
          <form onSubmit={otpSent ? handleVerifyOtp : handleSendOtp} className="bg-slate-900/80 p-6 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
            {/* Step 1: Identifier */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Email Address or Phone Number
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={identifier}
                  disabled={otpSent}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. john@example.com or +1 555-0144"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors disabled:opacity-60"
                />
                {otpSent && (
                  <button
                    type="button"
                    onClick={() => {
                      setOtpSent(false);
                      setReceivedOtp('');
                      setOtp('');
                    }}
                    className="absolute right-3 top-2.5 text-xs text-emerald-400 hover:underline"
                  >
                    Change
                  </button>
                )}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Demo emails: <span className="text-slate-400 font-mono">john@example.com</span> or <span className="text-slate-400 font-mono">admin@fintrack.com</span>
              </p>
            </div>

            {/* Step 2: OTP Code input */}
            {otpSent && (
              <div className="animate-fade-in space-y-2">
                <label className="block text-xs font-medium text-slate-300">
                  Enter 6-Digit Security OTP
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  autoFocus
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="• • • • • •"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-lg font-mono tracking-widest text-center text-emerald-400 placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                />
                <div className="flex justify-between items-center text-[11px] text-slate-400 pt-1">
                  <span>Didn't receive code?</span>
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={sendingOtp}
                    className="text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    <RefreshCw className={`w-3 h-3 ${sendingOtp ? 'animate-spin' : ''}`} /> Resend OTP
                  </button>
                </div>
              </div>
            )}

            {/* Action button */}
            <button
              type="submit"
              disabled={sendingOtp || verifyingOtp}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl text-sm transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 group disabled:opacity-50"
            >
              {otpSent ? (
                <>
                  <span>{verifyingOtp ? 'Verifying Code...' : 'Verify OTP & Secure Login'}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>{sendingOtp ? 'Dispatching OTP...' : 'Send Security OTP'}</span>
                </>
              )}
            </button>
          </form>
        ) : (
          /* Password Authentication Form */
          <form onSubmit={handlePasswordSubmit} className="bg-slate-900/80 p-6 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Email Address</label>
              <input
                type="email"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="e.g. john@example.com"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={verifyingOtp}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl text-sm transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 group disabled:opacity-50"
            >
              <span>{verifyingOtp ? 'Authenticating...' : 'Sign In with Password'}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </form>
        )}

        <p className="text-center text-xs text-slate-400">
          Don't have an account?{' '}
          <Link to="/register" className="text-emerald-400 hover:underline font-medium">
            Register with 2FA & $1,000 Welcome Bonus
          </Link>
        </p>
      </div>
    </div>
  );
};
