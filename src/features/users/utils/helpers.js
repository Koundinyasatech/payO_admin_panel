export const COLORS = ['#6C63FF', '#FF6584', '#43E97B', '#FA8231', '#E74C3C', '#3498DB', '#9B59B6', '#1ABC9C', '#E67E22', '#2ECC71'];

export function getInitials(name) {
  if (!name) return '?';
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

export function maskAccount(num) {
  if (!num) return '—';
  const s = String(num);
  return s.length <= 4 ? s : '•••• •••• ' + s.slice(-4);
}

export function kycLabel(v) { return v ? 'Verified' : 'Pending'; }
export function kycClass(v) { return v ? 'b-approved' : 'b-pending'; }

export function getCreationDate(u) {
  if (u.createdAt) return new Date(u.createdAt);
  if (u._id) return new Date(parseInt(String(u._id).substring(0, 8), 16) * 1000);
  return null;
}