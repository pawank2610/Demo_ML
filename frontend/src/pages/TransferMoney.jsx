import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { ReceiptModal } from '../components/ReceiptModal';
import {
  SendHorizontal,
  ShieldCheck,
  AlertTriangle,
  UserCheck,
  CheckCircle2,
  ArrowRight,
  Info,
} from 'lucide-react';

export const TransferMoney = () => {
  const { user, refreshUserData } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [toAccountNumber, setToAccountNumber] = useState('');
  const [recipientInfo, setRecipientInfo] = useState(null);
  const [recipientLoading, setRecipientLoading] = useState(false);
  const [recipientError, setRecipientError] = useState('');

  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [transferLoading, setTransferLoading] = useState(false);
  const [transferError, setTransferError] = useState('');

  // Receipt modal state
  const [completedTx, setCompletedTx] = useState(null);
  const [showReceipt, setShowReceipt] = useState(false);

  useEffect(() => {
    api.get('/accounts/my').then((res) => {
      if (res.data.success && res.data.accounts.length > 0) {
        setAccounts(res.data.accounts);
        setSelectedAccountId(res.data.accounts[0].id);
      }
    });
  }, []);

  // Live Debounced Recipient Verification
  useEffect(() => {
    const trimmed = toAccountNumber.trim().toUpperCase();
    if (trimmed.length < 5) {
      setRecipientInfo(null);
      setRecipientError('');
      return;
    }

    const timer = setTimeout(async () => {
      setRecipientLoading(true);
      setRecipientError('');
      try {
        const res = await api.get(`/accounts/lookup/${trimmed}`);
        if (res.data.success) {
          setRecipientInfo(res.data.account);
        }
      } catch (err) {
        setRecipientInfo(null);
        setRecipientError(err.response?.data?.message || 'Recipient account not found');
      } finally {
        setRecipientLoading(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [toAccountNumber]);

  const selectedAccount = accounts.find((a) => a.id === Number(selectedAccountId)) || accounts[0];
  const isHighValue = Number(amount) >= 10000;

  const handleTransfer = async (e) => {
    e.preventDefault();
    setTransferError('');

    if (!selectedAccountId || !toAccountNumber || !amount || Number(amount) <= 0) {
      setTransferError('Please complete all transfer details with a valid amount.');
      return;
    }

    if (Number(amount) > Number(selectedAccount?.balance || 0)) {
      setTransferError(`Insufficient balance! Your balance is $${Number(selectedAccount?.balance || 0).toFixed(2)}.`);
      return;
    }

    setTransferLoading(true);
    try {
      const res = await api.post('/transactions/transfer', {
        from_account_id: selectedAccountId,
        to_account_number: toAccountNumber.trim().toUpperCase(),
        amount: parseFloat(amount),
        description: description || 'Digital Peer Transfer',
      });

      if (res.data.success) {
        setCompletedTx({
          ...res.data.transaction,
          from_account: selectedAccount.account_number,
          to_account: toAccountNumber.trim().toUpperCase(),
        });
        setShowReceipt(true);
        setAmount('');
        setDescription('');
        setToAccountNumber('');
        setRecipientInfo(null);
        refreshUserData();
        // Refresh local account balance
        api.get('/accounts/my').then((r) => setAccounts(r.data.accounts));
      }
    } catch (err) {
      setTransferError(err.response?.data?.message || 'Transfer failed. Transaction was rolled back.');
    } finally {
      setTransferLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-extrabold text-white">Transfer Funds</h1>
        <p className="text-xs text-slate-400">
          Instant account-to-account transfer powered by ACID Transaction processing
        </p>
      </div>

      {/* Main Transfer Form Card */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 sm:p-8 shadow-xl space-y-6">
        {transferError && (
          <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-400 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Transaction Rolled Back (Atomicity Enforced)</p>
              <p>{transferError}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleTransfer} className="space-y-5">
          {/* 1. From Account Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              From Account
            </label>
            <select
              value={selectedAccountId}
              onChange={(e) => setSelectedAccountId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
            >
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.account_number} ({acc.account_type.toUpperCase()}) &mdash; Available: $
                  {Number(acc.balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </option>
              ))}
            </select>
            {selectedAccount && (
              <p className="text-[11px] text-slate-400 mt-1 flex justify-between">
                <span>Available Balance:</span>
                <span className="font-mono font-bold text-emerald-400">
                  ${Number(selectedAccount.balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </p>
            )}
          </div>

          {/* 2. Recipient Account Number with live verification */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Recipient Account Number
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={toAccountNumber}
                onChange={(e) => setToAccountNumber(e.target.value)}
                placeholder="e.g. FT100103 or FT100104"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white font-mono placeholder-slate-500 focus:outline-none focus:border-emerald-500 uppercase tracking-wider"
              />
              {recipientLoading && (
                <div className="absolute right-3.5 top-3 text-[11px] text-slate-400">Verifying...</div>
              )}
            </div>

            {/* Recipient verification pill */}
            {recipientInfo && (
              <div className="mt-2 p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-2 text-xs text-emerald-400">
                <UserCheck className="w-4 h-4 shrink-0" />
                <span>
                  Verified Recipient: <strong className="text-white">{recipientInfo.holder_name}</strong> ({recipientInfo.account_type})
                </span>
              </div>
            )}
            {recipientError && (
              <p className="text-[11px] text-rose-400 mt-1.5">{recipientError}</p>
            )}

            {/* Suggestion hints for easy demo */}
            <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-400">
              <span>Quick Test Accounts:</span>
              <button
                type="button"
                onClick={() => setToAccountNumber('FT100103')}
                className="font-mono text-emerald-400 hover:underline"
              >
                FT100103 (Sarah)
              </button>
              <span>&bull;</span>
              <button
                type="button"
                onClick={() => setToAccountNumber('FT100104')}
                className="font-mono text-emerald-400 hover:underline"
              >
                FT100104 (Robert)
              </button>
            </div>
          </div>

          {/* 3. Transfer Amount */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Amount to Transfer ($ USD)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-2.5 text-slate-500 font-bold">$</span>
              <input
                type="number"
                min="0.01"
                step="any"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-8 pr-4 py-2.5 text-base font-bold text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Quick chips */}
            <div className="flex gap-2 mt-2">
              {[50, 100, 250, 500, 1000].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setAmount(val.toString())}
                  className="flex-1 py-1 bg-slate-800 hover:bg-slate-700 text-[11px] font-semibold text-slate-300 rounded-lg transition-colors"
                >
                  ${val}
                </button>
              ))}
            </div>

            {/* High-value automated fraud trigger alert notice */}
            {isHighValue && (
              <div className="mt-3 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-300 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                <div>
                  <p className="font-semibold text-amber-200">High-Value Transaction Threshold (&ge; $10,000)</p>
                  <p className="text-[11px] text-amber-300/80">
                    The database trigger <code className="font-mono">trg_after_transaction_fraud_detection</code> will automatically log an alert in <code className="font-mono">fraud_alerts</code> for Admin review.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* 4. Description / Note */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Transfer Note / Memo
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Monthly rent, dinner split, project consulting"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={transferLoading}
            className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-sm transition-all shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 group disabled:opacity-50"
          >
            <SendHorizontal className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            <span>{transferLoading ? 'Processing ACID Transaction...' : 'Authorize & Send Money'}</span>
          </button>
        </form>

        <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            Transactions use row-level locks (<code className="text-slate-300 font-mono">FOR UPDATE</code>) to guarantee consistency without race conditions.
          </span>
        </div>
      </div>

      {/* Success Receipt Modal */}
      <ReceiptModal
        isOpen={showReceipt}
        onClose={() => setShowReceipt(false)}
        transaction={completedTx}
      />
    </div>
  );
};

