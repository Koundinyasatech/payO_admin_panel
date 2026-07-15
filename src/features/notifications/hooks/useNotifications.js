import { useState, useEffect } from 'react';
import { getAllSubmissions } from '../../../api/kyc.api';
import { buildNotificationFromKYC } from '../utils/helpers';

export function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    getAllSubmissions()
      .then(res => {
        const arr = res.data?.kycs || [];
        const built = (Array.isArray(arr) ? arr : [])
          .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
          .map(buildNotificationFromKYC);
        setNotifications(built);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const markOneRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const deleteOne = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const filtered = notifications.filter(n => {
    if (filter === 'Unread') return !n.read;
    if (filter === 'Read') return n.read;
    if (filter === 'KYC') return n.type.startsWith('kyc');
    if (filter === 'System') return n.type === 'system';
    return true;
  });

  return {
    notifications,
    loading,
    filter,
    unreadCount,
    filtered,
    setFilter,
    markAllRead,
    markOneRead,
    deleteOne,
  };
}