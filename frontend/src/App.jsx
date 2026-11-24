import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { ProtectedRoute } from './components/ProtectedRoute';

// Pages
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { CustomerDashboard } from './pages/CustomerDashboard';
import { TransferMoney } from './pages/TransferMoney';
import { TransactionHistory } from './pages/TransactionHistory';
import { Loans } from './pages/Loans';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { CustomerManagement } from './pages/admin/CustomerManagement';
import { LoanManagement } from './pages/admin/LoanManagement';
import { FraudMonitoring } from './pages/admin/FraudMonitoring';
import { AuditLogs } from './pages/admin/AuditLogs';

const AppLayout = ({ children, adminOnly = false }) => {
  return (
    <ProtectedRoute adminOnly={adminOnly}>
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full min-h-[calc(100vh-4rem)] overflow-y-auto">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
};

const RootRedirect = () => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
          <Navbar />
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Customer Routes */}
            <Route
              path="/dashboard"
              element={
                <AppLayout>
                  <CustomerDashboard />
                </AppLayout>
              }
            />
            <Route
              path="/transfer"
              element={
                <AppLayout>
                  <TransferMoney />
                </AppLayout>
              }
            />
            <Route
              path="/transactions"
              element={
                <AppLayout>
                  <TransactionHistory />
                </AppLayout>
              }
            />
            <Route
              path="/loans"
              element={
                <AppLayout>
                  <Loans />
                </AppLayout>
              }
            />

            {/* Bank Admin Routes */}
            <Route
              path="/admin"
              element={
                <AppLayout adminOnly>
                  <AdminDashboard />
                </AppLayout>
              }
            />
            <Route
              path="/admin/customers"
              element={
                <AppLayout adminOnly>
                  <CustomerManagement />
                </AppLayout>
              }
            />
            <Route
              path="/admin/loans"
              element={
                <AppLayout adminOnly>
                  <LoanManagement />
                </AppLayout>
              }
            />
            <Route
              path="/admin/fraud"
              element={
                <AppLayout adminOnly>
                  <FraudMonitoring />
                </AppLayout>
              }
            />
            <Route
              path="/admin/audit"
              element={
                <AppLayout adminOnly>
                  <AuditLogs />
                </AppLayout>
              }
            />

            {/* Fallback Root */}
            <Route path="/" element={<RootRedirect />} />
            <Route path="*" element={<RootRedirect />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

