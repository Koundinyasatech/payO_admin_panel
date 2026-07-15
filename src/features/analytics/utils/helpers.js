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

export const MONTH_ORDER = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];