export const CONFIG = {
  approve: { bg: '#F0FDF4', emoji: '✅', actionText: 'KYC Approved' },
  reject:  { bg: '#FEF2F2', emoji: '❌', actionText: 'KYC Rejected' },
  info:    { bg: '#EFF6FF', emoji: 'ℹ️', actionText: 'KYC Updated' },
};

export function getLogType(log) {
  const status = (log.status || '').toLowerCase();
  if (status === 'approved') return 'approve';
  if (status === 'rejected') return 'reject';
  return 'info';
}