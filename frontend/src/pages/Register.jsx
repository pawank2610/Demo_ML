import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import {
  Landmark,
  ArrowRight,
  Gift,
  AlertCircle,
  KeyRound,
  CheckCircle2,
  Smartphone,
  RefreshCw,
} from 'lucide-react';

export const Register = () => {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
  });

  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [receivedOtp, setReceivedOtp] = useState('');
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const { sendOtp, verifyOtp } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Step 1: Request Registration OTP
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!formData.full_name || !formData.email || !formData.password) {
      setError('Please provide full name, email, and a secure password.');
      return;
    }

    setSendingOtp(true);
    try {
      const res = await sendOtp(formData.email.trim(), 'register');
      if (res.success) {
        setOtpSent(true);
        setReceivedOtp(res.otp || '');
        setSuccessMsg(`Security verification OTP dispatched to ${formData.email}!`);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to dispatch verification code.');
    } finally {
      setSendingOtp(false);
    }
  };

  // Step 2: Verify OTP and finalize account creation
  const handleFinalizeRegistration = async (e) => {
    e.preventDefault();
    setError('');

    if (!otp.trim()) {
      setError('Please enter the 6-digit OTP code.');
      return;
    }

    setVerifyingOtp(true);
    try {
      await verifyOtp(formData.email.trim(), otp.trim(), 'register', formData);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'OTP verification failed');
    } finally {
      setVerifyingOtp(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-indigo-600 flex items-center justify-center text-white mx-auto shadow-xl shadow-indigo-500/20">
            <Landmark className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Open Digital Bank Account</h2>
          <p className="text-xs text-slate-400">Two-Factor OTP Verified & Privacy Enforced</p>
        </div>

        {/* Welcome Bonus Notice */}
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center gap-3 text-xs text-emerald-400">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center shrink-0">
            <Gift className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <p className="font-semibold text-white">Instant $1,000.00 Opening Deposit</p>
            <p className="text-[11px] text-emerald-400/80">Credited automatically once your OTP is verified!</p>
          </div>
        </div>

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

        {/* Simulated Banking Notification with 1-Click Auto-Fill */}
        {receivedOtp && otpSent && (
          <div className="p-3.5 bg-gradient-to-r from-emerald-950/60 to-slate-900 border border-emerald-500/40 rounded-xl text-xs space-y-2 animate-fade-in">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-emerald-300 flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-emerald-400" /> Verification Code (Simulated)
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Valid 5 mins</span>
            </div>
            <div className="flex items-center justify-between bg-slate-950/80 p-2.5 rounded-lg border border-emerald-500/30">
              <div>
                <span className="text-[11px] text-slate-400 block">Registration Security OTP:</span>
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

        <form onSubmit={otpSent ? handleFinalizeRegistration : handleRequestOtp} className="bg-slate-900/80 p-6 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
          {!otpSent ? (
            <>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Full Legal Name</label>
                <input
                  type="text"
                  name="full_name"
                  required
                  value={formData.full_name}
                  onChange={handleChange}
                  placeholder="e.g. Alex Morgan"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="e.g. alex@example.com"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Create Password</label>
                <input
                  type="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Phone Number</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+1 555-0123"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">City / Address</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="New York, NY"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={sendingOtp}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl text-sm transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 group disabled:opacity-50"
              >
                <KeyRound className="w-4 h-4" />
                <span>{sendingOtp ? 'Dispatching OTP...' : 'Send Verification OTP'}</span>
              </button>
            </>
          ) : (
            /* Step 2: Fill OTP to activate account */
            <div className="space-y-4 animate-fade-in">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-1">
                <p>Verifying: <strong className="text-white">{formData.email}</strong></p>
                <p className="text-[11px] text-slate-400">Account holder: {formData.full_name}</p>
                <button
                  type="button"
                  onClick={() => setOtpSent(false)}
                  className="text-emerald-400 hover:underline text-[11px]"
                >
                  Edit Information
                </button>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Enter 6-Digit Verification Code
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
              </div>

              <div className="flex justify-between items-center text-[11px] text-slate-400">
                <span>Didn't receive code?</span>
                <button
                  type="button"
                  onClick={handleRequestOtp}
                  disabled={sendingOtp}
                  className="text-emerald-400 hover:underline flex items-center gap-1"
                >
                  <RefreshCw className={`w-3 h-3 ${sendingOtp ? 'animate-spin' : ''}`} /> Resend OTP
                </button>
              </div>

              <button
                type="submit"
                disabled={verifyingOtp}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl text-sm transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 group disabled:opacity-50"
              >
                <span>{verifyingOtp ? 'Verifying & Opening Account...' : 'Confirm OTP & Open Account'}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          )}
        </form>

        <p className="text-center text-xs text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="text-emerald-400 hover:underline font-medium">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};
