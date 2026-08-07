import { useState, useEffect } from 'react';
import { getWalletProfile } from '../../../api/walletApi';
import { getAllSubmissions } from '../../../api/kyc.api';
import { COLORS, getInitials } from '../utils/helpers';

export function useUsers() {
  const [users, setUsers] = useState([]);
  const [totals, setTotals] = useState({ total: 0, verified: 0, pending: 0 });
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

        // ── Fetch KYC submissions ──────────────────────────────────────────────
        const kycRes = await getAllSubmissions();
        const kycList = kycRes.data?.kycs || [];

        // ── Extract unique users from KYC records ────────────────────────────
        const userMap = new Map();
        kycList.forEach(kyc => {
          const userId = kyc.userId?._id || kyc.userId;
          if (!userId) return;

          // Only store if not already present (first occurrence)
          if (!userMap.has(userId)) {
            const name = kyc.userId?.name || kyc.fullName || 'Unknown';
            const email = kyc.userId?.email || '';
            const mobile = kyc.userId?.mobile || '';
            const kycVerified = kyc.status === 'approved';

            userMap.set(userId, {
              _id: userId,
              name,
              email,
              mobile,
              kycVerified,
              // Additional fields will be filled by wallet data later
              walletAddress: '—',
              walletBalance: 0,
              referralCode: '—',
              referredBy: '—',
              referralCount: 0,
              referralEarnings: 0,
              transactionCount: 0,
              bankDetails: null,
              initials: getInitials(name),
              color: COLORS[userMap.size % COLORS.length],
            });
          }
        });

        const baseUsers = Array.from(userMap.values());

        // ── Enrich with wallet data ──────────────────────────────────────────
        const enhanced = await Promise.all(
          baseUsers.map(async (u, idx) => {
            try {
              const walletRes = await getWalletProfile(u._id);
              const walletData = walletRes.data?.data || walletRes.data || {};
              return {
                ...u,
                walletAddress: u.walletAddress || walletData.walletAddress || '—',
                walletBalance: u.walletBalance ?? walletData.balance ?? 0,
                referralCode: walletData.referralCode || '—',
                referredBy: walletData.referredBy || u.referredBy || '—',
                referralCount: walletData.referralCount ?? u.referralCount ?? 0,
                referralEarnings: walletData.referralEarnings ?? u.referralEarnings ?? 0,
                transactionCount: walletData.transactionCount ?? 0,
                bankDetails: walletData.bankDetails || walletRes.bankDetails || null,
              };
            } catch {
              return u; // fallback already has defaults
            }
          })
        );

        setUsers(enhanced);
        setTotals({
          total: enhanced.length,
          verified: enhanced.filter(u => u.kycVerified).length,
          pending: enhanced.filter(u => !u.kycVerified).length,
        });
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load users');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // ─── Filtering ──────────────────────────────────────────────────────────────
  const filtered = users.filter(u => {
    const matchKYC = fKYC === 'All' ||
      (fKYC === 'Verified' && u.kycVerified) ||
      (fKYC === 'Pending' && !u.kycVerified);

    const q = search.toLowerCase();
    const matchSearch = !q ||
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