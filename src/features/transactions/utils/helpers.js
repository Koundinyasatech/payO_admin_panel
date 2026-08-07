export function truncateWallet(addr) {
  if (!addr || addr === '—' || addr === 'REFERRAL_BONUS') return addr || '—';
  if (addr.length <= 18) return addr;
  return addr.slice(0, 10) + '…' + addr.slice(-6);
}

export function formatDate(str, full = false) {
  if (!str) return '—';
  const d = new Date(str);
  if (full) {
    return d.toLocaleString('en-IN', {
      day: '2-digit', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    });
  }
  return d.toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

// Status config
export const STATUS_CFG = {
  success: { cls: 'b-approved', label: 'Success', color: '#059669', dot: '#10B981' },
  pending: { cls: 'b-pending', label: 'Pending', color: '#D97706', dot: '#F59E0B' },
  failed: { cls: 'b-failed', label: 'Failed', color: '#DC2626', dot: '#EF4444' },
};
export function getStatus(s) {
  return STATUS_CFG[String(s || '').toLowerCase()] ||
    { cls: 'b-review', label: s || '—', color: '#2563EB', dot: '#3B82F6' };
}

// Type config — derived from senderWallet
export const TYPE_CFG = {
  reward: { icon: '★', label: 'Reward', grad: 'linear-gradient(135deg,#B45309,#F59E0B)', glow: 'rgba(245,158,11,0.3)', credit: true },
  transfer: { icon: '⇄', label: 'Transfer', grad: 'linear-gradient(135deg,#1D4ED8,#3B82F6)', glow: 'rgba(59,130,246,0.3)', credit: false },
};
export function deriveType(txn) {
  if ((txn.senderWallet || '').toUpperCase() === 'REFERRAL_BONUS') return 'reward';
  return 'transfer';
}
export function getType(txn) {
  return TYPE_CFG[deriveType(txn)];
}

export const DATE_OPTS = [
  { label: 'All Time', value: 'all' },
  { label: 'Today', value: 'today' },
  { label: 'Last 7 Days', value: 'week' },
  { label: 'Last 30 Days', value: 'month' },
];