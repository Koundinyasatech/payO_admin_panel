import { getAllUsers, getTransactions, getReferrals } from '../../../api/adminApi';

const fmtDate = d => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

export const REPORTS = [
  {
    id: 'users',
    title: 'User Report',
    icon: '👥',
    description: 'Full user list with KYC verification status, wallet balances, addresses, and registration details.',
    contains: ['User list', 'KYC status', 'Wallet balance & address', 'Join date'],
    color: '#2563EB',
    bg: '#EFF6FF',
    border: '#BFDBFE',
    sheetName: 'Users',
    headers: ['User ID', 'Name', 'Email', 'Mobile', 'KYC Status', 'Wallet Balance (PYO)', 'Wallet Address', 'Role', 'Joined Date'],
    async fetchData() {
      const res = await getAllUsers();
      return res.data?.users || [];
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
        u.role || 'user',
        fmtDate(u.createdAt),
      ]);
    },
  },
  {
    id: 'transactions',
    title: 'Transaction Report',
    icon: '💸',
    description: 'All transaction records including amounts, statuses, sender/receiver details, and timestamps.',
    contains: ['All transaction records', 'Sender & receiver info', 'Status & failure reasons', 'Transaction type'],
    color: '#059669',
    bg: '#F0FDF4',
    border: '#A7F3D0',
    sheetName: 'Transactions',
    headers: ['Transaction ID', 'Type', 'Sender', 'Receiver', 'Amount (PYO)', 'Status', 'Failure Reason', 'Date'],
    async fetchData() {
      const res = await getTransactions({ limit: 10000, page: 1 });
      return res.data?.transactions || [];
    },
    toRows(data) {
      return data.map(t => [
        String(t.transactionId || ''),
        t.senderWallet === 'REFERRAL_BONUS' ? 'Referral Bonus' : 'Transfer',
        t.senderWallet === 'REFERRAL_BONUS' ? 'System (Referral)' : (t.senderName || t.senderWallet || ''),
        t.receiverName || t.receiverWallet || '',
        t.amount ?? 0,
        t.status || '',
        t.failureReason || '',
        fmtDate(t.createdAt),
      ]);
    },
  },
  {
    id: 'referrals',
    title: 'Referral Report',
    icon: '🎁',
    description: 'Referral activity showing referrer details, referred users, reward amounts and payout statuses.',
    contains: ['Referral activity', 'Referrer & referred user info', 'Reward amounts', 'Reward status'],
    color: '#7C3AED',
    bg: '#F5F3FF',
    border: '#DDD6FE',
    sheetName: 'Referrals',
    headers: ['Referrer Name', 'Referrer Email', 'Referral Code', 'Referred User', 'Referred Email', 'Referred Mobile', 'Joined Date', 'Reward Amount (PYO)', 'Reward Status'],
    async fetchData() {
      const res = await getReferrals({ limit: 10000, page: 1 });
      return res.data?.referrals || [];
    },
    toRows(data) {
      return data.map(r => [
        r.referrer?.name || '',
        r.referrer?.email || '',
        r.referrer?.referralCode || '',
        r.referredUser?.name || '',
        r.referredUser?.email || '',
        r.referredUser?.mobile || '',
        fmtDate(r.referredUser?.joinedAt),
        r.rewardAmount ?? 0,
        r.rewardStatus || '',
      ]);
    },
  },
];