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