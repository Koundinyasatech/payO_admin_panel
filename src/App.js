// src/App.js
import { BrowserRouter, useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import './App.css';
import { useState, useEffect, createContext } from 'react';
import ConfirmDialog from './components/ConfirmDialog';
import Login from './features/auth/pages/Login';
import { AppRoutes } from './router/AppRoutes';
import api from './api/Axios'; // your configured axios instance

export const AppCtx = createContext({});

function AppInner() {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dark, setDark] = useState(() => {
    try { return localStorage.getItem('payo-dark') === 'true'; } catch { return false; }
  });
  const [dlg, setDlg] = useState(null);

  // ─── Session verification on load ──────────────────────────────
  useEffect(() => {
    const verifySession = async () => {
      const token = localStorage.getItem('payo_token');
      const savedAdmin = localStorage.getItem('payo_admin');

      // No token → go to login
      if (!token || !savedAdmin) {
        setLoading(false);
        return;
      }

      try {
        // ✅ Try to fetch a protected resource (e.g., user profile)
        // Use any authenticated endpoint – we use the KYC endpoint as a "ping".
        // Adjust the URL to your actual endpoint.
        await api.get('/api/admin/kyc/all-submissions', { params: { _t: Date.now() } });
        // If we get here, the token is valid.
        const adminData = JSON.parse(savedAdmin);
        setAdmin(adminData);
      } catch (error) {
        // Network error, 401, or any failure → clear session
        console.warn('Session verification failed:', error.message);
        localStorage.removeItem('payo_token');
        localStorage.removeItem('payo_admin');
        setAdmin(null);
      } finally {
        setLoading(false);
      }
    };

    verifySession();
  }, []);

  // ─── Dark mode ──────────────────────────────────────────────────
  useEffect(() => {
    document.body.classList.toggle('dark', dark);
    try { localStorage.setItem('payo-dark', dark); } catch {}
  }, [dark]);

  const handleLogin = (adminData, token) => {
    localStorage.setItem('payo_token', token);
    localStorage.setItem('payo_admin', JSON.stringify(adminData));
    setAdmin(adminData);
    setTimeout(() => navigate('/'), 100);
  };

  const handleLogout = () => {
    localStorage.removeItem('payo_token');
    localStorage.removeItem('payo_admin');
    setAdmin(null);
  };

  const confirm = (config, onConfirm) => setDlg({ config, onConfirm });
  const closeDialog = () => setDlg(null);
  const adminRole = admin?.adminRole || null;

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0A0A0A' }}>
        <div style={{ textAlign: 'center' }}>
          <img src={process.env.PUBLIC_URL + "/images/payo-icon-logo-removebg-preview.png"} alt="PayO" style={{ width: 72, height: 72, objectFit: 'contain', marginBottom: 20, opacity: 0.8 }}/>
          <div style={{ width: 32, height: 32, border: '3px solid rgba(255,255,255,0.15)', borderTopColor: '#3B82F6', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }}/>
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      </div>
    );
  }

  return (
    <AppCtx.Provider value={{ confirm, dark, adminRole }}>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: dark ? '#1f2937' : '#363636',
            color: '#fff',
            borderRadius: '8px',
          },
        }}
      />
      {!admin
        ? <Login onLogin={handleLogin} />
        : <AppRoutes
            admin={admin}
            onAdminUpdate={(updated) => {
              setAdmin(updated);
              localStorage.setItem('payo_admin', JSON.stringify(updated));
            }}
            onLogout={handleLogout}
            dark={dark}
            toggleDark={() => setDark(d => !d)}
          />
      }
      <ConfirmDialog
        config={dlg?.config}
        onConfirm={() => { dlg?.onConfirm?.(); closeDialog(); }}
        onCancel={closeDialog}
      />
    </AppCtx.Provider>
  );
}

export default function App() {
  return (
    <BrowserRouter basename={process.env.PUBLIC_URL}>
      <AppInner />
    </BrowserRouter>
  );
}