import React from 'react';
import { CheckCircle2, X, Download, ShieldCheck, ArrowRight } from 'lucide-react';

export const ReceiptModal = ({ isOpen, onClose, transaction }) => {
  if (!isOpen || !transaction) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-white">Transfer Confirmed</h3>
          <p className="text-xs text-slate-400">ACID Transaction Committed to Database</p>
        </div>

        {/* Amount */}
        <div className="my-6 p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Amount Sent</span>
          <div className="text-3xl font-extrabold text-white mt-1">
            ${Number(transaction.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
        </div>

        {/* Details list */}
        <div className="space-y-3 text-xs border-y border-slate-800 py-4">
          <div className="flex justify-between items-center text-slate-400">
            <span>Transaction Ref</span>
            <span className="font-mono text-slate-200">#FTX-{transaction.id || Math.floor(100000 + Math.random() * 900000)}</span>
          </div>
          <div className="flex justify-between items-center text-slate-400">
            <span>From Account</span>
            <span className="font-mono text-slate-200">{transaction.from_account || transaction.from_account_number || 'N/A'}</span>
          </div>
          <div className="flex justify-between items-center text-slate-400">
            <span>To Recipient</span>
            <span className="font-mono text-slate-200">{transaction.to_account || transaction.to_account_number || 'N/A'}</span>
          </div>
          <div className="flex justify-between items-center text-slate-400">
            <span>Status</span>
            <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold uppercase text-[10px] bg-emerald-500/10 px-2 py-0.5 rounded">
              <ShieldCheck className="w-3 h-3" /> {transaction.status || 'Completed'}
            </span>
          </div>
          <div className="flex justify-between items-center text-slate-400">
            <span>Timestamp</span>
            <span className="text-slate-200">{new Date(transaction.created_at || Date.now()).toLocaleString()}</span>
          </div>
        </div>

        {/* Close Button */}
        <div className="mt-6">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl text-sm transition-colors shadow-lg shadow-emerald-600/20"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

