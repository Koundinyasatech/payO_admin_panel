import { useState, useEffect, useContext } from 'react';
import { getAllSubmissions } from '../../../api/kyc.api';
import { getWalletProfile } from '../../../api/walletApi';
import { AppCtx } from '../../../App';
import { getInitials, normalizeStatus, COLORS } from '../utils/helpers';

export function useWallets() {
  const { confirm } = useContext(AppCtx);
  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('active');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchWallets = async () => {
      setLoading(true);
      try {
        const res = await getAllSubmissions();
        const arr = res.data?.kycs || [];
        const mapped = (Array.isArray(arr) ? arr : []).map((r, idx) => {
          const name = r.fullName || r.userId?.name || 'Unknown';
          const kycStatus = normalizeStatus(r.status);
          const isActive = kycStatus === 'Approved';
          return {
            userId: r.userId?._id || r._id || String(idx),
            user: name,
            initials: getInitials(name),
            color: COLORS[idx % COLORS.length],
            kycStatus,
            status: isActive ? 'Active' : 'Deactivated',
            tokens: 0,
            email: r.userId?.email || '—',
            mobile: r.userId?.mobile || '—',
          };
        });
        setWallets(mapped);
        setLoading(false);

        // Fetch token balances for each wallet
        const updated = await Promise.all(
          mapped.map(async (w) => {
            try {
              const balRes = await getWalletProfile(w.userId);
              const data = balRes.data?.data || balRes.data || {};
              const balance = data.balance ?? 0;
              return { ...w, tokens: balance };
            } catch {
              return w;
            }
          })
        );
        setWallets(updated);
      } catch (err) {
        console.error('Error fetching wallets:', err);
        setLoading(false);
      }
    };
    fetchWallets();
  }, []);

  // Toggle wallet status (local only – no backend endpoint yet)
  const toggleWallet = (userId) => {
    const wallet = wallets.find(w => w.userId === userId);
    if (!wallet) return;
    const isActive = wallet.status === 'Active';
    confirm({
      title: isActive ? 'Deactivate Wallet' : 'Activate Wallet',
      message: isActive
        ? `Are you sure you want to deactivate ${wallet.user}'s wallet?`
        : `Activate ${wallet.user}'s wallet? They will be able to transact PYO tokens.`,
      confirmLabel: isActive ? '🔒 Yes, Deactivate' : '🔓 Yes, Activate',
      cancelLabel: 'Cancel',
      type: isActive ? 'danger' : 'success',
    }, () => {
      setWallets(prev => prev.map(w => w.userId === userId ? { ...w, status: w.status === 'Active' ? 'Deactivated' : 'Active' } : w));
    });
  };

  const active = wallets.filter(w => w.status === 'Active');
  const deactivated = wallets.filter(w => w.status === 'Deactivated');
  const list = (tab === 'active' ? active : deactivated).filter(w => {
    const q = search.toLowerCase();
    return !q
      || w.user.toLowerCase().includes(q)
      || String(w.userId).toLowerCase().includes(q)
      || w.email.toLowerCase().includes(q)
      || w.mobile.toLowerCase().includes(q);
  });

  return {
    wallets,
    loading,
    tab,
    search,
    active,
    deactivated,
    list,
    setTab,
    setSearch,
    toggleWallet,
  };
}