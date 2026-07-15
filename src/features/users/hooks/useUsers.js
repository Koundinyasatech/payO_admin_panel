import { useState, useEffect } from 'react';
import { getAllUsers } from '../../../api/adminApi';
import { getWalletProfile } from '../../../api/walletApi';
import { COLORS, getInitials } from '../utils/helpers';

export function useUsers() {
  const [users, setUsers] = useState([]);
  const [totals, setTotals] = useState({ total:0, verified:0, pending:0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [fKYC, setFKYC] = useState('All');
  const [page, setPage] = useState(1);

  const per = 8;

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const res = await getAllUsers();
        const arr = res.data?.users || res.data?.data?.users || res.data?.result?.users || [];

        const enhanced = await Promise.all(
          arr.map(async (u, idx) => {
            try {
              const walletRes = await getWalletProfile(u._id);
              const walletData = walletRes.data?.data || walletRes.data || {};
              return {
                ...u,
                walletAddress:    u.walletAddress    || walletData.walletAddress    || '—',
                walletBalance:    u.walletBalance    ?? walletData.balance          ?? 0,
                referralCode:     walletData.referralCode   || '—',
                referredBy:       walletData.referredBy     || u.referredBy         || '—',
                referralCount:    walletData.referralCount  ?? u.referralCount      ?? 0,
                referralEarnings: walletData.referralEarnings ?? u.referralEarnings ?? 0,
                transactionCount: walletData.transactionCount ?? 0,
                bankDetails:      walletData.bankDetails    || walletRes.bankDetails || null,
                initials: getInitials(u.name),
                color: COLORS[idx % COLORS.length],
              };
            } catch {
              return {
                ...u,
                walletAddress: u.walletAddress || '—',
                walletBalance: u.walletBalance ?? 0,
                referralCode:  u.referralCode  || '—',
                referredBy:    u.referredBy    || '—',
                referralCount: u.referralCount ?? 0,
                referralEarnings: u.referralEarnings ?? 0,
                transactionCount: 0,
                initials: getInitials(u.name),
                color: COLORS[idx % COLORS.length],
              };
            }
          })
        );

        setUsers(enhanced);
        setTotals({
          total: res.data?.total ?? arr.length,
          verified: res.data?.verified ?? 0,
          pending: res.data?.pending ?? 0,
        });
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load users');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const filtered = users.filter(u => {
    const matchKYC = fKYC === 'All' || (fKYC === 'Verified' && u.kycVerified === true) || (fKYC === 'Pending' && u.kycVerified === false);
    const q = search.toLowerCase();
    const matchSearch = !search || 
      (u.name || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q) ||
      (u.mobile || '').toLowerCase().includes(q) ||
      String(u._id).toLowerCase().includes(q);
    return matchKYC && matchSearch;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / per));
  const pagedUsers = filtered.slice((page - 1) * per, page * per);

  return {
    users,
    totals,
    loading,
    error,
    search,
    fKYC,
    page,
    filtered,
    pagedUsers,
    totalPages,
    per,
    setSearch,
    setFKYC,
    setPage,
  };
}