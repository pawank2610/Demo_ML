import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  CheckSquare,
  Check,
  X,
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Coins,
} from 'lucide-react';

export const LoanManagement = () => {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeModalLoan, setActiveModalLoan] = useState(null);
  const [modalAction, setModalAction] = useState('approved'); // 'approved' | 'rejected'
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState('');

  const fetchLoans = async () => {
    try {
      setLoading(true);
      const res = await api.get('/loans/all');
      if (res.data.success) {
        setLoans(res.data.loans);
      }
    } catch (err) {
      console.error('Failed to load loans:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoans();
  }, []);

  const openActionModal = (loan, action) => {
    setActiveModalLoan(loan);
    setModalAction(action);
    setRemarks(
      action === 'approved'
        ? 'Application meets credit requirements. Income and employment verified.'
        : 'Debt-to-Income (DTI) ratio exceeds acceptable bank policy limits.'
    );
  };

  const handleDecision = async (e) => {
    e.preventDefault();
    if (!activeModalLoan) return;

    setSubmitting(true);
    try {
      const res = await api.patch(`/loans/${activeModalLoan.id}/status`, {
        status: modalAction,
        remarks,
      });

      if (res.data.success) {
        setFeedback(
          modalAction === 'approved'
            ? `Loan #${activeModalLoan.id} approved! $${Number(activeModalLoan.amount).toLocaleString()} disbursed into customer balance.`
            : `Loan #${activeModalLoan.id} has been rejected.`
        );
        setTimeout(() => setFeedback(''), 4000);
      }

      setActiveModalLoan(null);
      await fetchLoans();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update loan status');
    } finally {
      setSubmitting(false);
    }
  };

  const pendingCount = loans.filter((l) => l.status === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-white">Loan Application Approval Queue</h1>
            {pendingCount > 0 && (
              <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs px-2.5 py-0.5 rounded-full font-bold">
                {pendingCount} Pending
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Evaluate applicant financials, authorize credit, and automatically disburse loan funds
          </p>
        </div>

        <button
          onClick={fetchLoans}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 rounded-xl border border-slate-700 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh Queue
        </button>
      </div>

      {/* Prominent success notification */}
      {feedback && (
        <div className="p-4 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl flex items-center gap-3 text-xs text-emerald-300 animate-fade-in shadow-lg shadow-emerald-500/10">
          <Coins className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="font-semibold">{feedback}</span>
        </div>
      )}

      {/* Loans Table */}
      <div className="bg-slate-900/80 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading loan applications...</div>
        ) : loans.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <CheckSquare className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="text-sm font-semibold text-slate-300">No applications in the queue</p>
            <p className="text-xs text-slate-500">Customer loan applications will appear here in real time.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/40 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Ref #</th>
                  <th className="py-3.5 px-4">Applicant</th>
                  <th className="py-3.5 px-4">Loan Type</th>
                  <th className="py-3.5 px-4">Monthly Income</th>
                  <th className="py-3.5 px-4">Requested Amount</th>
                  <th className="py-3.5 px-4">Calculated EMI</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-center">Admin Decision</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs text-slate-300">
                {loans.map((loan) => (
                  <tr key={loan.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400 font-bold">
                      #LN-{loan.id}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-white">
                      {loan.applicant_name}
                      <span className="block text-[11px] text-slate-400 font-normal">{loan.applicant_email}</span>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-200">
                      {loan.loan_type}
                      <span className="block text-[10px] text-slate-500 font-mono">
                        {loan.term_months} mos @ {loan.interest_rate}% APR
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-300">
                      ${Number(loan.monthly_income).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-white">
                      ${Number(loan.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-emerald-400 font-semibold">
                      ${Number(loan.monthly_emi).toFixed(2)}/mo
                    </td>
                    <td className="py-3.5 px-4 text-center">
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
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {loan.status === 'pending' ? (
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => openActionModal(loan, 'approved')}
                            className="flex items-center gap-1 px-2.5 py-1 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white rounded-lg text-xs font-semibold transition-colors border border-emerald-500/30"
                            title="Approve & Disburse Funds"
                          >
                            <Check className="w-3.5 h-3.5" /> Approve
                          </button>
                          <button
                            onClick={() => openActionModal(loan, 'rejected')}
                            className="flex items-center gap-1 px-2.5 py-1 bg-rose-600/20 hover:bg-rose-600 text-rose-400 hover:text-white rounded-lg text-xs font-semibold transition-colors border border-rose-500/30"
                            title="Reject Loan"
                          >
                            <X className="w-3.5 h-3.5" /> Reject
                          </button>
                        </div>
                      ) : (
                        <div className="text-[11px] text-slate-400">
                          <span className="capitalize">{loan.status}</span>
                          {loan.remarks && (
                            <span className="block text-[10px] text-slate-500 truncate max-w-xs mx-auto">
                              "{loan.remarks}"
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Decision Modal */}
      {activeModalLoan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-2.5">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                  modalAction === 'approved' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                }`}
              >
                {modalAction === 'approved' ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="text-base font-bold text-white capitalize">{modalAction} Loan Application</h3>
                <p className="text-xs text-slate-400">
                  Loan #LN-{activeModalLoan.id} &bull; ${Number(activeModalLoan.amount).toLocaleString()} for {activeModalLoan.applicant_name}
                </p>
              </div>
            </div>

            {modalAction === 'approved' && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-300">
                Approving will execute an ACID transaction to disburse <strong>${Number(activeModalLoan.amount).toLocaleString()}</strong> directly into the customer's account!
              </div>
            )}

            <form onSubmit={handleDecision} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Committee Review Notes / Remarks
                </label>
                <textarea
                  rows={3}
                  required
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setActiveModalLoan(null)}
                  className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className={`flex-1 py-2 text-white text-xs font-semibold rounded-xl disabled:opacity-50 ${
                    modalAction === 'approved'
                      ? 'bg-emerald-600 hover:bg-emerald-500'
                      : 'bg-rose-600 hover:bg-rose-500'
                  }`}
                >
                  {submitting ? 'Executing Decision...' : `Confirm ${modalAction.toUpperCase()}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
