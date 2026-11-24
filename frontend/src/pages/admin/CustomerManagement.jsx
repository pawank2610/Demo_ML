import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Users, Lock, Unlock, Shield, Search, CheckCircle2, AlertTriangle } from 'lucide-react';

export const CustomerManagement = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/customers');
      if (res.data.success) {
        setCustomers(res.data.customers);
      }
    } catch (err) {
      console.error('Failed to load customers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleToggleStatus = async (accountId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'frozen' : 'active';
    setActionLoading(accountId);
    try {
      await api.patch(`/admin/accounts/${accountId}/toggle-status`, { status: newStatus });
      fetchCustomers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update account status');
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = customers.filter(
    (c) =>
      c.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase()) ||
      c.account_number?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Customer Account Management</h1>
          <p className="text-xs text-slate-400">
            Inspect customer portfolios, account balances, and security freeze controls
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email, or account..."
            className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900/80 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading customers...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">No customer records matching search.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/40 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Customer Name</th>
                  <th className="py-3.5 px-4">Contact Info</th>
                  <th className="py-3.5 px-4">Account Number</th>
                  <th className="py-3.5 px-4">Account Type</th>
                  <th className="py-3.5 px-4 text-right">Balance</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs text-slate-300">
                {filtered.map((c) => (
                  <tr key={c.account_id || c.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-white">
                      {c.full_name}
                      <span className="block text-[11px] text-slate-400 font-normal">UID: #{c.id}</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">
                      <div>{c.email}</div>
                      <div className="text-[11px] text-slate-500">{c.phone || 'No phone'}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-200">
                      {c.account_number || 'Pending'}
                    </td>
                    <td className="py-3.5 px-4 uppercase text-[11px] font-semibold text-slate-400">
                      {c.account_type || 'Savings'}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-400">
                      ${Number(c.balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          c.account_status === 'active'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}
                      >
                        {c.account_status || 'active'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {c.account_id && (
                        <button
                          onClick={() => handleToggleStatus(c.account_id, c.account_status)}
                          disabled={actionLoading === c.account_id}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                            c.account_status === 'active'
                              ? 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20'
                              : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20'
                          }`}
                        >
                          {c.account_status === 'active' ? (
                            <>
                              <Lock className="w-3 h-3" /> Freeze
                            </>
                          ) : (
                            <>
                              <Unlock className="w-3 h-3" /> Unfreeze
                            </>
                          )}
                        </button>
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

