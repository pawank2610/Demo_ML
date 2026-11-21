import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  BadgePercent,
  Calculator,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  Clock,
  Check,
  X,
  Send,
  Building,
  RefreshCw,
} from 'lucide-react';

export const Loans = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('calculator'); // 'calculator' | 'applications'

  // Calculator & Application State
  const [loanType, setLoanType] = useState('Personal Loan');
  const [amount, setAmount] = useState(15000);
  const [termMonths, setTermMonths] = useState(24);
  const [monthlyIncome, setMonthlyIncome] = useState(5500);
  const [interestRate, setInterestRate] = useState(8.5);

  const [accounts, setAccounts] = useState([]);
  const [selectedAccountId, setSelectedAccountId] = useState('');

  // Eligibility evaluation state
  const [calcResult, setCalcResult] = useState(null);
  const [calcLoading, setCalcLoading] = useState(false);

  // Application submission
  const [applyLoading, setApplyLoading] = useState(false);
  const [applySuccess, setApplySuccess] = useState('');
  const [applyError, setApplyError] = useState('');

  // My Loans list
  const [myLoans, setMyLoans] = useState([]);
  const [loansLoading, setLoansLoading] = useState(true);

  // Fetch user accounts
  useEffect(() => {
    api.get('/accounts/my').then((res) => {
      if (res.data.success && res.data.accounts.length > 0) {
        setAccounts(res.data.accounts);
        setSelectedAccountId(res.data.accounts[0].id.toString());
      }
    });
  }, []);

  // Fetch my loans
  const fetchMyLoans = async () => {
    try {
      setLoansLoading(true);
      const res = await api.get('/loans/my');
      if (res.data.success) {
        setMyLoans(res.data.loans);
      }
    } catch (err) {
      console.error('Failed to load my loans:', err);
    } finally {
      setLoansLoading(false);
    }
  };

  useEffect(() => {
    fetchMyLoans();
  }, [activeTab]);

  // Dynamic Loan Rate Presets based on Loan Type
  const handleLoanTypeChange = (type) => {
    setLoanType(type);
    if (type === 'Home Loan') setInterestRate(7.25);
    else if (type === 'Education Loan') setInterestRate(6.50);
    else if (type === 'Business Loan') setInterestRate(9.00);
    else setInterestRate(8.50); // Personal
  };

  // Evaluate eligibility on slider changes
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (amount > 0 && termMonths > 0 && monthlyIncome > 0) {
        setCalcLoading(true);
        try {
          const res = await api.post('/loans/check-eligibility', {
            amount: Number(amount),
            term_months: Number(termMonths),
            monthly_income: Number(monthlyIncome),
            annual_rate: interestRate,
          });
          if (res.data.success) {
            setCalcResult(res.data.data);
          }
        } catch (err) {
          console.error(err);
        } finally {
          setCalcLoading(false);
        }
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [amount, termMonths, monthlyIncome, interestRate]);

  // Submit Loan Application
  const handleApply = async (e) => {
    e.preventDefault();
    setApplyError('');
    setApplySuccess('');

    const accountIdToUse = selectedAccountId || (accounts.length > 0 ? accounts[0].id : null);
    if (!accountIdToUse) {
      setApplyError('Please choose or create an account for disbursement.');
      return;
    }

    setApplyLoading(true);
    try {
      const res = await api.post('/loans/apply', {
        account_id: Number(accountIdToUse),
        loan_type: loanType,
        amount: Number(amount),
        term_months: Number(termMonths),
        monthly_income: Number(monthlyIncome),
        annual_rate: interestRate,
      });

      if (res.data.success) {
        setApplySuccess('Loan application submitted! Dispatched to Bank Admin queue for review.');
        fetchMyLoans();
        setTimeout(() => {
          setActiveTab('applications');
          setApplySuccess('');
        }, 1200);
      }
    } catch (err) {
      setApplyError(err.response?.data?.message || 'Loan application failed.');
    } finally {
      setApplyLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Navigation Tabs */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Loan Management & Eligibility</h1>
          <p className="text-xs text-slate-400">
            Real-time Debt-to-Income (DTI) engine with automated risk assessment & approval tracking
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('calculator')}
            className={`px-3.5 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === 'calculator'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Eligibility Calculator
          </button>
          <button
            onClick={() => setActiveTab('applications')}
            className={`px-3.5 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === 'applications'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            My Applications ({myLoans.length})
          </button>
        </div>
      </div>

      {activeTab === 'calculator' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Form & Sliders */}
          <div className="lg:col-span-7 bg-slate-900/90 p-6 rounded-2xl border border-slate-800 space-y-6 shadow-xl">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <Calculator className="w-4 h-4 text-emerald-400" />
              <span>Configure Your Loan</span>
            </div>

            {/* Loan Type Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
                Select Loan Type
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {['Personal Loan', 'Home Loan', 'Education Loan', 'Business Loan'].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => handleLoanTypeChange(type)}
                    className={`py-2 px-2.5 rounded-xl text-xs font-semibold border transition-all text-center ${
                      loanType === type
                        ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* 1. Loan Amount Slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-semibold uppercase tracking-wider">Requested Loan Amount</span>
                <span className="text-base font-extrabold font-mono text-emerald-400">
                  ${Number(amount).toLocaleString()}
                </span>
              </div>
              <input
                type="range"
                min="1000"
                max="100000"
                step="1000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full accent-emerald-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>$1,000</span>
                <span>$50,000</span>
                <span>$100,000</span>
              </div>
            </div>

            {/* 2. Term (Months) Slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-semibold uppercase tracking-wider">Repayment Term</span>
                <span className="text-base font-extrabold font-mono text-white">
                  {termMonths} Months ({Math.round(termMonths / 12 * 10) / 10} Yrs)
                </span>
              </div>
              <input
                type="range"
                min="6"
                max="84"
                step="6"
                value={termMonths}
                onChange={(e) => setTermMonths(e.target.value)}
                className="w-full accent-emerald-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>6 mos</span>
                <span>36 mos</span>
                <span>84 mos</span>
              </div>
            </div>

            {/* 3. Declared Monthly Income Slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-semibold uppercase tracking-wider">Your Monthly Income</span>
                <span className="text-base font-extrabold font-mono text-indigo-400">
                  ${Number(monthlyIncome).toLocaleString()}
                </span>
              </div>
              <input
                type="range"
                min="1000"
                max="30000"
                step="500"
                value={monthlyIncome}
                onChange={(e) => setMonthlyIncome(e.target.value)}
                className="w-full accent-indigo-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>$1,000</span>
                <span>$15,000</span>
                <span>$30,000+</span>
              </div>
            </div>

            {/* Disbursement Account Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                Disbursement Account
              </label>
              <select
                value={selectedAccountId}
                onChange={(e) => setSelectedAccountId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.account_number} ({acc.account_type.toUpperCase()}) &mdash; Balance: ${Number(acc.balance).toFixed(2)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Right Column: Real-time Eligibility Breakdown & Application */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-slate-900/90 p-6 rounded-2xl border border-slate-800 space-y-5 shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Calculated Monthly EMI
                </span>
                <span className="text-xs font-mono font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                  {interestRate}% APR
                </span>
              </div>

              {/* Big EMI Highlight */}
              <div className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                ${calcResult ? Number(calcResult.estimated_emi).toLocaleString('en-US', { minimumFractionDigits: 2 }) : '0.00'}
                <span className="text-xs font-normal text-slate-400 ml-1">/ month</span>
              </div>

              {/* Status Banner */}
              {calcResult && (
                <div
                  className={`p-3.5 rounded-xl border flex items-start gap-3 text-xs ${
                    calcResult.status === 'eligible'
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                      : calcResult.status === 'conditional'
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                      : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                  }`}
                >
                  {calcResult.status === 'eligible' ? (
                    <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-emerald-400" />
                  ) : (
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p className="font-bold capitalize">{calcResult.status} (DTI: {calcResult.dti_ratio_percent}%)</p>
                    <p className="text-[11px] mt-0.5 opacity-90">{calcResult.message}</p>
                  </div>
                </div>
              )}

              {/* Repayment Breakdown */}
              <div className="space-y-2.5 border-t border-slate-800 pt-4 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Total Principal</span>
                  <span className="font-mono text-slate-200">${Number(amount).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Total Interest Payable</span>
                  <span className="font-mono text-slate-200">
                    ${calcResult ? Number(calcResult.total_interest).toLocaleString() : '0'}
                  </span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Total Payment</span>
                  <span className="font-mono font-bold text-white">
                    ${calcResult ? Number(calcResult.total_repayment).toLocaleString() : '0'}
                  </span>
                </div>
              </div>

              {applySuccess && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-400 flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  <span>{applySuccess}</span>
                </div>
              )}
              {applyError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-400">
                  {applyError}
                </div>
              )}

              {/* Submit Application Button */}
              <button
                type="button"
                onClick={handleApply}
                disabled={applyLoading || (calcResult && calcResult.status === 'ineligible')}
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-sm transition-all shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{applyLoading ? 'Submitting Application...' : 'Apply for this Loan'}</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Applications List Tab */
        <div className="bg-slate-900/80 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
          <div className="p-4 border-b border-slate-800 flex justify-between items-center">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Your Submitted Loans</span>
            <button
              onClick={fetchMyLoans}
              className="text-xs text-emerald-400 hover:underline flex items-center gap-1"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loansLoading ? 'animate-spin' : ''}`} /> Refresh
            </button>
          </div>

          {loansLoading ? (
            <div className="p-12 text-center text-xs text-slate-400">Loading your loan applications...</div>
          ) : myLoans.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <BadgePercent className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-sm font-semibold text-slate-300">No loan applications on record</p>
              <p className="text-xs text-slate-500">Use the calculator tab to apply for your first loan.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-800/60">
              {myLoans.map((loan) => (
                <div key={loan.id} className="p-5 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-slate-800/30 transition-colors">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-white">{loan.loan_type}</span>
                      <span className="font-mono text-xs text-slate-400">#LN-{loan.id}</span>
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          loan.status === 'approved'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : loan.status === 'rejected'
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}
                      >
                        {loan.status}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                      <span>Term: <strong className="text-slate-200">{loan.term_months} Months</strong></span>
                      <span>Interest: <strong className="text-slate-200">{loan.interest_rate}% APR</strong></span>
                      <span>Disbursement Acc: <strong className="text-slate-200 font-mono">{loan.account_number}</strong></span>
                    </div>

                    {loan.remarks && (
                      <p className="text-xs text-slate-400 italic pt-1">
                        Bank Review Note: "{loan.remarks}"
                      </p>
                    )}
                  </div>

                  <div className="text-left sm:text-right">
                    <div className="text-xl font-black text-white font-mono">
                      ${Number(loan.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </div>
                    <div className="text-xs text-emerald-400 font-medium">
                      EMI: ${Number(loan.monthly_emi).toFixed(2)}/mo
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
