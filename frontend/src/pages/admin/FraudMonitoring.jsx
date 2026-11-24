import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { ShieldAlert, CheckCircle, XCircle, AlertTriangle, Info, Clock } from 'lucide-react';

export const FraudMonitoring = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/fraud/alerts');
      if (res.data.success) {
        setAlerts(res.data.alerts);
      }
    } catch (err) {
      console.error('Failed to load fraud alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleUpdateStatus = async (id, status) => {
    setActionLoading(id);
    try {
      await api.patch(`/fraud/alerts/${id}/status`, { status });
      fetchAlerts();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update alert');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-extrabold text-white">Automated Fraud Surveillance</h1>
        <p className="text-xs text-slate-400">
          Suspicious and high-value transactions flagged by MySQL trigger <code className="font-mono text-emerald-400">trg_after_transaction_fraud_detection</code>
        </p>
      </div>

      {/* Explanatory banner */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-xs text-amber-300">
        <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-amber-400" />
        <div className="space-y-1">
          <p className="font-bold text-amber-200">Automated DBMS Rule Engine</p>
          <p className="text-[11px] text-amber-300/80">
            Whenever any fund transfer exceeds <strong>$10,000.00</strong>, the database <code className="font-mono font-bold">AFTER INSERT</code> trigger fires immediately, preventing unmonitored money laundering without relying solely on application-level code.
          </p>
        </div>
      </div>

      {/* Alerts Table */}
      <div className="bg-slate-900/80 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading fraud alerts...</div>
        ) : alerts.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <ShieldAlert className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="text-sm font-semibold text-slate-300">No security alerts detected</p>
            <p className="text-xs text-slate-500">All recent transactions comply with banking thresholds.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/40 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Alert Time</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4">Detection Reason</th>
                  <th className="py-3.5 px-4 text-center">Severity</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs text-slate-300">
                {alerts.map((al) => (
                  <tr key={al.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                      {new Date(al.created_at).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-white">
                      {al.customer_name || 'Account Holder'}
                      <span className="block text-[11px] text-slate-400 font-normal">{al.customer_email || 'Verified user'}</span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-rose-400">
                      ${Number(al.transaction_amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 max-w-xs leading-relaxed">
                      {al.reason}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          al.severity === 'high'
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}
                      >
                        {al.severity}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          al.status === 'flagged'
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            : al.status === 'reviewed'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-slate-700 text-slate-300'
                        }`}
                      >
                        {al.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {al.status === 'flagged' ? (
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleUpdateStatus(al.id, 'reviewed')}
                            disabled={actionLoading === al.id}
                            className="px-2.5 py-1 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white rounded-lg text-[11px] font-semibold transition-colors border border-emerald-500/30"
                          >
                            Mark Reviewed
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(al.id, 'dismissed')}
                            disabled={actionLoading === al.id}
                            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg text-[11px] font-semibold transition-colors border border-slate-700"
                          >
                            Dismiss
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-500 italic">Resolved</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

