export function normalizeStatus(s) {
  if (!s) return 'Pending';
  const map = {
    'Under Review': 'In Review',
    'under_review': 'In Review',
    'documents_uploaded': 'In Review',
    'not_started': 'Pending',
    'Pending': 'Pending',
    'approved': 'Approved',
    'rejected': 'Failed',
    'Approved': 'Approved',
    'Rejected': 'Failed',
    'Verified': 'Approved',
  };
  return map[s] || s;
}