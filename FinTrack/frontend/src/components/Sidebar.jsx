import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  SendHorizontal,
  History,
  BadgePercent,
  Users,
  ShieldAlert,
  ClipboardList,
  CheckSquare,
  WalletCards,
} from 'lucide-react';

export const Sidebar = () => {
  const { isAdmin } = useAuth();

  const customerNav = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Transfer Funds', path: '/transfer', icon: SendHorizontal },
    { name: 'Transaction History', path: '/transactions', icon: History },
    { name: 'Loans & Eligibility', path: '/loans', icon: BadgePercent },
  ];

  const adminNav = [
    { name: 'Executive Overview', path: '/admin', icon: LayoutDashboard },
    { name: 'Customer Accounts', path: '/admin/customers', icon: Users },
    { name: 'Loan Approvals', path: '/admin/loans', icon: CheckSquare },
    { name: 'Fraud Monitoring', path: '/admin/fraud', icon: ShieldAlert },
    { name: 'Audit Security Logs', path: '/admin/audit', icon: ClipboardList },
  ];

  const links = isAdmin ? adminNav : customerNav;

  return (
    <aside className="w-64 bg-slate-900/60 border-r border-slate-800 flex flex-col justify-between p-4 shrink-0 min-h-[calc(100vh-4rem)]">
      <div className="space-y-6">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 px-3">
            {isAdmin ? 'Bank Administration' : 'Customer Banking'}
          </span>
          <nav className="mt-2 space-y-1">
            {links.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/dashboard' || item.path === '/admin'}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? isAdmin
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                          : 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  {item.name}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* DBMS Concept Indicator Card */}
        <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/60 text-xs text-slate-400 space-y-2">
          <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
            <WalletCards className="w-4 h-4 text-emerald-400" />
            <span>DBMS Architecture</span>
          </div>
          <p className="text-[11px] leading-relaxed text-slate-400">
            Backed by MySQL 3NF schema, ACID isolation locks, automated triggers for fraud detection & audit logging.
          </p>
        </div>
      </div>

      <div className="text-center text-[11px] text-slate-500 border-t border-slate-800/80 pt-3">
        FinTrack Banking System &copy; 2026
      </div>
    </aside>
  );
};

