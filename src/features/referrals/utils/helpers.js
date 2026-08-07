export function formatDate(str) {
  if (!str) return '—';
  return new Date(str).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

// Reward status config
export const statusBadge = (status) => {
  const map = {
    'ACTIVE': { label: 'Active', cls: 'badge-success' },
    'INACTIVE': { label: 'Inactive', cls: 'badge-danger' },
    'PENDING': { label: 'Pending', cls: 'badge-warning' },
    // add any other statuses you expect
  };
  return map[status?.toUpperCase()] || { label: status || '—', cls: 'badge-secondary' };
};