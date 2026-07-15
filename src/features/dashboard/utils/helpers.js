export const COLORS = [
  '#6C63FF', '#FF6584', '#43E97B', '#FA8231', '#E74C3C',
  '#3498DB', '#9B59B6', '#1ABC9C', '#E67E22', '#2ECC71'
];

export function getInitials(name) {
  if (!name) return '?';
  return name.split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Normalize backend KYC status → display status
 * Backend enum: not_started | documents_uploaded | under_review | approved | rejected
 */
export function normalizeStatus(s) {
  if (!s) return 'Pending';
  const map = {
    not_started: 'Pending',
    documents_uploaded: 'In Review',
    under_review: 'In Review',
    approved: 'Approved',
    rejected: 'Failed',
  };
  return map[s] || s;
}

export function statusBadge(s) {
  const classes = {
    Pending: 'b-pending',
    'In Review': 'b-review',
    Approved: 'b-approved',
    Failed: 'b-failed'
  };
  return <span className={`badge ${classes[s] || 'b-pending'}`}>{s}</span>;
}