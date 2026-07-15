import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useContext } from 'react';
import { AppCtx } from '../App';
import AdminProfile from './AdminProfile';

const titles = {
  '/': 'Dashboard', '/kyc': 'KYC Review', '/users': 'Users',
  '/wallets': 'Wallets', '/analytics': 'Analytics',
  '/audit':         'Audit Log',
  '/notifications': 'Notifications',
  '/transactions':  'Transactions',
  '/referrals':     'Referrals',
  '/reports':       'Reports',
};

export function Topbar({ admin, onAdminUpdate, onLogout, dark, toggleDark }) {
  const loc = useLocation();
  const nav = useNavigate();
  const [search, setSearch] = useState('');
  const { confirm } = useContext(AppCtx);
  const title = titles[loc.pathname] || 'Dashboard';

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
    <header className="topbar">
      <div className="topbar-title">{title}</div>

      <div className="topbar-search">
        <svg width="14" height="14" fill="none" stroke="var(--gray-400)" strokeWidth="2" viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input placeholder="Search user, document, status..." value={search} onChange={e => setSearch(e.target.value)}/>
      </div>

      <div className="topbar-right">
        <button className="dark-toggle" onClick={toggleDark} title={dark ? 'Light mode' : 'Dark mode'}>
          {dark ? '☀️' : '🌙'}
        </button>

        <button className="notif-btn" onClick={() => nav('/notifications')}>
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 01-3.46 0"/>
          </svg>
        </button>

        <AdminProfile
          admin={admin}
          onUpdate={onAdminUpdate}
          onLogout={handleLogout}
          dark={dark}
        />
      </div>
    </header>
  );
}