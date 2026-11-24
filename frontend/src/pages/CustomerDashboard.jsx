import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import api from '../services/api';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  SendHorizontal,
  BadgePercent,
  PlusCircle,
  Copy,
  Check,
  ShieldCheck,
  TrendingUp,
  CreditCard,
  RefreshCw,
} from 'lucide-react';

export const CustomerDashboard = () => {
  const { user, refreshUserData } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [depositLoading, setDepositLoading] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [accRes, txRes] = await Promise.all([
        api.get('/accounts/my'),
        api.get('/transactions/history?limit=5'),
      ]);

      if (accRes.data.success) {
        setAccounts(accRes.data.accounts);
      }
      if (txRes.data.success) {
        setTransactions(txRes.data.transactions.slice(0, 5));
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const primaryAccount = accounts[0] || {
    account_number: 'FT100101',
    balance: 0,
    account_type: 'savings',
    status: 'active',
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(primaryAccount.account_number);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleQuickDeposit = async (e) => {
    e.preventDefault();
    if (!depositAmount || Number(depositAmount) <= 0) return;
    setDepositLoading(true);
    try {
      await api.post('/accounts/deposit', {
        account_id: primaryAccount.id,
        amount: parseFloat(depositAmount),
        description: 'Instant Funds Deposit',
      });
      setShowDepositModal(false);
      setDepositAmount('');
      fetchDashboardData();
      refreshUserData();
    } catch (err) {
      alert(err.response?.data?.message || 'Deposit failed');
    } finally {
      setDepositLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">
            Welcome back, <span className="text-emerald-400">{user?.full_name}</span>
          </h1>
          <p className="text-xs text-slate-400">
            Account verified & protected by FinTrack ACID Banking Core
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowDepositModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl border border-slate-700 transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5 text-emerald-400" /> Simulate Deposit
          </button>
          <Link
            to="/transfer"
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium rounded-xl transition-all shadow-md shadow-emerald-600/20"
          >
            <SendHorizontal className="w-3.5 h-3.5" /> Transfer Funds
          </Link>
        </div>
      </div>

      {/* Primary Account Card + Stat Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Fintech Virtual Debit Card */}
        <div className="lg:col-span-2 relative overflow-hidden rounded-2xl bg-gradient-to-tr from-slate-900 via-slate-800 to-indigo-950 p-6 sm:p-7 border border-slate-700/80 shadow-2xl">
          <div className="flex justify-between items-start mb-6">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Primary {primaryAccount.account_type} Account
              </span>
              <div className="text-3xl sm:text-4xl font-black text-white mt-1 tracking-tight">
                ${Number(primaryAccount.balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
            </div>
            <div className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full text-xs font-medium capitalize">
              <ShieldCheck className="w-3.5 h-3.5" /> {primaryAccount.status}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 pt-4 border-t border-slate-700/60">
            <div>
              <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Account Number</span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="font-mono text-base font-bold text-slate-100 tracking-wider">
                  {primaryAccount.account_number}
                </span>
                <button
                  onClick={handleCopy}
                  className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-700/50 transition-colors"
                  title="Copy Account Number"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Account Holder</span>
              <span className="text-sm font-semibold text-slate-200">{user?.full_name}</span>
            </div>
          </div>
        </div>

        {/* Quick Insights Card */}
        <div className="bg-slate-900/80 rounded-2xl p-6 border border-slate-800 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 text-slate-300 font-semibold text-sm mb-4">
              <TrendingUp className="w-4 h-4 text-emerald-400" /> Quick Actions
            </div>
            <div className="space-y-2.5">
              <Link
                to="/transfer"
                className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 transition-colors text-xs text-slate-200"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                    <SendHorizontal className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">Send Money</p>
                    <p className="text-[11px] text-slate-400">ACID Instant Transfer</p>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-500" />
              </Link>

              <Link
                to="/loans"
                className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 transition-colors text-xs text-slate-200"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                    <BadgePercent className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">Loan Calculator</p>
                    <p className="text-[11px] text-slate-400">Check EMI & Eligibility</p>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-500" />
              </Link>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 bg-slate-950/40 p-3 rounded-xl border border-slate-800/60">
            Protected with Row-Level Locks and Automatic Fraud Threshold Flags (&gt; $10k).
          </div>
        </div>
      </div>

      {/* Recent Transactions Section */}
      <div className="bg-slate-900/80 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-white">Recent Transactions</h3>
            <span className="text-[11px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-mono">
              Latest {transactions.length}
            </span>
          </div>
          <Link to="/transactions" className="text-xs text-emerald-400 hover:text-emerald-300 font-medium">
            View All Ledger &rarr;
          </Link>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-slate-500">Loading recent transactions...</div>
        ) : transactions.length === 0 ? (
          <div className="p-8 text-center space-y-2">
            <p className="text-sm text-slate-400">No transactions recorded yet.</p>
            <p className="text-xs text-slate-500">Make your first fund transfer or simulated deposit above!</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/60">
            {transactions.map((tx) => {
              const isSender = tx.from_account_id === primaryAccount.id;
              const isDeposit = tx.transaction_type === 'deposit';

              return (
                <div key={tx.id} className="p-4 sm:px-6 flex items-center justify-between hover:bg-slate-800/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isDeposit || (!isSender && tx.transaction_type === 'transfer')
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : 'bg-rose-500/10 text-rose-400'
                      }`}
                    >
                      {isDeposit || (!isSender && tx.transaction_type === 'transfer') ? (
                        <ArrowDownLeft className="w-4 h-4" />
                      ) : (
                        <ArrowUpRight className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-200">
                        {tx.description || (isDeposit ? 'Deposit' : 'Fund Transfer')}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {new Date(tx.created_at).toLocaleDateString()} &bull; {tx.transaction_type}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div
                      className={`text-sm font-bold font-mono ${
                        isDeposit || (!isSender && tx.transaction_type === 'transfer')
                          ? 'text-emerald-400'
                          : 'text-slate-100'
                      }`}
                    >
                      {isDeposit || (!isSender && tx.transaction_type === 'transfer') ? '+' : '-'}
                      ${Number(tx.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </div>
                    <span
                      className={`text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded ${
                        tx.status === 'completed'
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : tx.status === 'flagged'
                          ? 'bg-amber-500/10 text-amber-400'
                          : 'bg-rose-500/10 text-rose-400'
                      }`}
                    >
                      {tx.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Deposit Simulation Modal */}
      {showDepositModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-sm p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-2">Simulate Funds Deposit</h3>
            <p className="text-xs text-slate-400 mb-4">
              Credits funds directly into your account ({primaryAccount.account_number}) to test transactions and loans.
            </p>
            <form onSubmit={handleQuickDeposit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Amount ($ USD)</label>
                <input
                  type="number"
                  min="1"
                  step="any"
                  required
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="e.g. 500.00"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex gap-2">
                {[100, 500, 1000, 5000].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setDepositAmount(val.toString())}
                    className="flex-1 py-1 text-xs bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 font-medium"
                  >
                    +${val}
                  </button>
                ))}
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDepositModal(false)}
                  className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={depositLoading}
                  className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium rounded-xl disabled:opacity-50"
                >
                  {depositLoading ? 'Depositing...' : 'Confirm Deposit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

