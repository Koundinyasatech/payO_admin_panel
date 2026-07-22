import { getTransactions, getReferrals } from '../../../api/adminApi';
import { getAllSubmissions } from '../../../api/kyc.api';

const fmtDate = d => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

export const REPORTS = [
  {
    id: 'users',
    title: 'User Report',
    icon: '👥',
    description: 'User list extracted from KYC submissions with verification status.',
    contains: ['User list', 'KYC status', 'Wallet balance & address', 'Join date'],
    color: '#2563EB',
    bg: '#EFF6FF',
    border: '#BFDBFE',
    sheetName: 'Users',
    headers: ['User ID', 'Name', 'Email', 'Mobile', 'KYC Status', 'Wallet Balance (PYO)', 'Wallet Address', 'Joined Date'],
    async fetchData() {
      const res = await getAllSubmissions();
      const kycs = res.data?.kycs || [];
      // Build unique users from KYC records
      const userMap = new Map();
      kycs.forEach(k => {
        const uid = k.userId?._id || k.userId;
        if (!uid) return;
        if (!userMap.has(uid)) {
          userMap.set(uid, {
            _id: uid,
            name: k.userId?.name || k.fullName || 'Unknown',
            email: k.userId?.email || '',
            mobile: k.userId?.mobile || '',
            kycVerified: k.status === 'approved',
            walletAddress: k.userId?.walletAddress || '',
            walletBalance: 0, // we don't have balance in KYC data
            createdAt: k.createdAt || ''
          });
        }
      });
      return Array.from(userMap.values());
    },
    toRows(data) {
      return data.map(u => [
        String(u._id || ''),
        u.name || '',
        u.email || '',
        u.mobile || '',
        u.kycVerified ? 'Verified' : 'Pending',
        u.walletBalance ?? 0,
        u.walletAddress || '',
        fmtDate(u.createdAt),
      ]);
    },
  },
  // ... other reports remain the same
];