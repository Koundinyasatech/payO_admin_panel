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

export const TYPE_CONFIG = {
  kyc_request:  { bg: '#EFF6FF', emoji: '🔔' },
  kyc_approved: { bg: '#F0FDF4', emoji: '✅' },
  kyc_rejected: { bg: '#FEF2F2', emoji: '❌' },
  system:       { bg: '#FFFBEB', emoji: '⚠️' },
};

/**
 * Build a notification object from a KYC submission record
 */
export function buildNotificationFromKYC(record, idx) {
  const name = record.fullName || record.userId?.name || 'Unknown';
  const status = normalizeStatus(record.status);
  let type, title, message;

  if (status === 'Approved') {
    type = 'kyc_approved';
    title = `KYC Approved — ${name}`;
    message = 'Identity verified successfully. Wallet activated.';
  } else if (status === 'Failed') {
    type = 'kyc_rejected';
    title = `KYC Rejected — ${name}`;
    message = record.rejectionReason || 'Documents did not meet verification criteria.';
  } else {
    type = 'kyc_request';
    title = `New KYC Submission — ${name}`;
    message = 'Submitted identity documents for review.';
  }

  const date = new Date(record.createdAt || Date.now());
  const now = new Date();
  const diff = Math.floor((now - date) / 60000);
  let time;
  if (diff < 1) time = 'Just now';
  else if (diff < 60) time = `${diff} min ago`;
  else if (diff < 1440) time = `${Math.floor(diff / 60)} hr ago`;
  else time = date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });

  return {
    id: record._id || idx,
    type,
    title,
    message,
    time,
    read: status !== 'Pending',
    raw: record,
  };
}