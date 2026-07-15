export function formatDate(str) {
  if (!str) return '—';
  return new Date(str).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

// Reward status config
export const STATUS_CFG = {
  paid: { cls: 'b-approved', label: 'Paid' },
  pending: { cls: 'b-pending', label: 'Pending' },
  failed: { cls: 'b-failed', label: 'Failed' },
  held: { cls: 'b-review', label: 'Held' },
};
export function statusBadge(s) {
  return STATUS_CFG[String(s || '').toLowerCase()] ||
    { cls: 'b-review', label: s || '—' };
}