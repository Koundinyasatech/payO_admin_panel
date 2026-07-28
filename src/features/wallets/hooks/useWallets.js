// src/hooks/useWallets.js
import { useState, useEffect, useCallback } from 'react';
import { getPendingPayoDeposits } from '../../../api/adminApi';

export function useWallets(userId = null, autoFetch = true) {
  const [pendingDeposits, setPendingDeposits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  const fetchPending = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Pass userId to the API function (null = fetch all)
      const res = await getPendingPayoDeposits(userId);
      const data = res.data?.data || [];
      setPendingDeposits(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching pending deposits:', err);
      const msg = err.response?.data?.message || err.message || 'Failed to fetch deposits.';
      setError(msg);
      setPendingDeposits([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (autoFetch) {
      fetchPending();
    }
  }, [userId, autoFetch, fetchPending]);

  const filtered = pendingDeposits.filter(d => {
    const q = search.toLowerCase();
    return !q ||
      (d.Wallet_ID || '').toLowerCase().includes(q) ||
      (d.Full_Name || '').toLowerCase().includes(q) ||
      (d.User_Transaction_Id || '').toLowerCase().includes(q) ||
      (d.Transaction_Uid || '').toLowerCase().includes(q);
  });

  return {
    pendingDeposits,
    filtered,
    loading,
    error,
    search,
    setSearch,
    totalPending: pendingDeposits.length,
    refetch: fetchPending,
  };
}