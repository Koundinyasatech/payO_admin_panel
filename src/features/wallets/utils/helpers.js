export function getInitials(name) {
  if (!name) return '?';
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

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

export const COLORS = ['#6C63FF','#FF6584','#43E97B','#FA8231','#E74C3C','#3498DB','#9B59B6','#1ABC9C'];