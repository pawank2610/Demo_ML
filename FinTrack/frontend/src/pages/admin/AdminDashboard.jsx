import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import {
  Users,
  BadgeDollarSign,
  CheckSquare,
  ShieldAlert,
  ArrowUpRight,
  TrendingUp,
  Activity,
  Layers,
} from 'lucide-react';

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/dashboard-stats')
      .then((res) => {
        if (res.data.success) {
          setStats(res.data.stats);
        }
      })
      .catch((err) => console.error('Failed to load admin stats:', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase font-extrabold tracking-wider bg-indigo-500/10 text-indigo-400 px-2.5 py-0.5 rounded-full border border-indigo-500/20">
            Executive Control
          </span>
        </div>
        <h1 className="text-2xl font-extrabold text-white mt-1">Bank Administrator Dashboard</h1>
        <p className="text-xs text-slate-400">
          Real-time banking health, customer liquidity, loan exposure & automated fraud surveillance
        </p>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Liquidity */}
        <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-xl space-y-2">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Deposits</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <BadgeDollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white font-mono">
            ${stats ? Number(stats.total_deposits).toLocaleString('en-US', { minimumFractionDigits: 2 }) : '0.00'}
          </div>
          <p className="text-[11px] text-slate-400">Total liquidity held in customer accounts</p>
        </div>

        {/* Registered Customers */}
        <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-xl space-y-2">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Customers</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white font-mono">
            {stats ? stats.total_customers : '0'}
          </div>
          <p className="text-[11px] text-slate-400">Verified digital banking accounts</p>
        </div>

        {/* Pending Loans */}
        <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-xl space-y-2">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Pending Loans</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <CheckSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-400 font-mono">
            {stats ? stats.pending_loans : '0'}
          </div>
          <p className="text-[11px] text-slate-400">Awaiting committee review & approval</p>
        </div>

        {/* High Risk Fraud Alerts */}
        <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-xl space-y-2">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Unresolved Alerts</span>
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-rose-400 font-mono">
            {stats ? stats.unreviewed_alerts : '0'}
          </div>
          <p className="text-[11px] text-slate-400">High-value automated trigger flags</p>
        </div>
      </div>

      {/* Quick Action Navigation Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Loan Review Quick Link */}
        <Link
          to="/admin/loans"
          className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950/60 border border-indigo-500/20 hover:border-indigo-500/50 transition-all flex justify-between items-center group"
        >
          <div className="space-y-1">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Loan Approval Queue</span>
            <h3 className="text-base font-bold text-white group-hover:text-indigo-200">
              Review & Disburse Applications &rarr;
            </h3>
            <p className="text-xs text-slate-400">
              Inspect applicant DTI ratio, declared income, and disburse approved funds instantly.
            </p>
          </div>
          <ArrowUpRight className="w-6 h-6 text-indigo-400 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
        </Link>

        {/* Fraud Monitoring Quick Link */}
        <Link
          to="/admin/fraud"
          className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-rose-950/40 border border-rose-500/20 hover:border-rose-500/50 transition-all flex justify-between items-center group"
        >
          <div className="space-y-1">
            <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">Fraud & Security Monitor</span>
            <h3 className="text-base font-bold text-white group-hover:text-rose-200">
              Audit Flagged Transactions &rarr;
            </h3>
            <p className="text-xs text-slate-400">
              Real-time surveillance of transactions exceeding $10,000 threshold.
            </p>
          </div>
          <ArrowUpRight className="w-6 h-6 text-rose-400 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
        </Link>
      </div>

      {/* DBMS Concepts in Action Banner */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
        <div className="flex items-center gap-2 text-white font-bold text-sm">
          <Layers className="w-4 h-4 text-emerald-400" />
          <span>Active Relational Database Features (MySQL)</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-400">
          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
            <span className="font-semibold text-slate-200 block mb-1">ACID Atomicity</span>
            Transactions use explicit <code className="font-mono text-emerald-400">BEGIN / COMMIT / ROLLBACK</code> blocks to ensure zero balance drift.
          </div>
          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
            <span className="font-semibold text-slate-200 block mb-1">Row-Level Locks</span>
            Concurrent access protected with <code className="font-mono text-emerald-400">SELECT ... FOR UPDATE</code> isolation.
          </div>
          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
            <span className="font-semibold text-slate-200 block mb-1">Automated Triggers</span>
            Database triggers automatically populate <code className="font-mono text-emerald-400">fraud_alerts</code> and <code className="font-mono text-emerald-400">audit_logs</code>.
          </div>
        </div>
      </div>
    </div>
  );
};

