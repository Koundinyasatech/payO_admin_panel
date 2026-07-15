import { useContext } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AppCtx } from '../App';
import Sidebar from '../components/Sidebar';
import { Topbar } from '../components/Topbar';
import { ProtectedRoute } from './ProtectedRoute';
import Dashboard from '../features/dashboard/pages/Dashboard';
import KYCReview from '../features/kyc/pages/KYCReview';
import Users from '../features/users/pages/Users';
import Wallets from '../features/wallets/pages/Wallets';
import Analytics from '../features/analytics/pages/Analytics';
import AuditLog from '../features/audit/pages/AuditLog';
import Notifications from '../features/notifications/pages/Notifications';
import Transactions from '../features/transactions/pages/Transactions';
import Referrals from '../features/referrals/pages/Referrals';
import Reports from '../features/reports/pages/Reports';

export function AppRoutes({ admin, onAdminUpdate, onLogout, dark, toggleDark }) {
  const { confirm } = useContext(AppCtx);

  const handleLogout = () => {
    confirm({
      title: 'Sign Out',
      message: 'Are you sure you want to sign out of the PayO Admin Portal?',
      confirmLabel: 'Yes, Sign Out',
      cancelLabel: 'Stay',
      type: 'danger',
    }, onLogout);
  };

  return (
    <div className="layout">
      <Sidebar onLogout={handleLogout} />
      <div className="main">
        <Topbar
          admin={admin}
          onAdminUpdate={onAdminUpdate}
          onLogout={onLogout}
          dark={dark}
          toggleDark={toggleDark}
        />
        <Routes>
          <Route index element={<Dashboard />} />
          <Route path="/" element={<Dashboard />} />
          <Route path="/kyc" element={<ProtectedRoute path="/kyc"><KYCReview /></ProtectedRoute>} />
          <Route path="/users" element={<ProtectedRoute path="/users"><Users /></ProtectedRoute>} />
          <Route path="/wallets" element={<ProtectedRoute path="/wallets"><Wallets /></ProtectedRoute>} />
          <Route path="/analytics" element={<ProtectedRoute path="/analytics"><Analytics /></ProtectedRoute>} />
          <Route path="/audit" element={<ProtectedRoute path="/audit"><AuditLog /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute path="/notifications"><Notifications /></ProtectedRoute>} />
          <Route path="/transactions" element={<ProtectedRoute path="/transactions"><Transactions /></ProtectedRoute>} />
          <Route path="/referrals" element={<ProtectedRoute path="/referrals"><Referrals /></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute path="/reports"><Reports /></ProtectedRoute>} />
        </Routes>
      </div>
    </div>
  );
}