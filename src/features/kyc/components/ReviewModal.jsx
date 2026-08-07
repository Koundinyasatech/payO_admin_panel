// src/features/kyc/components/ReviewModal.jsx
import { useState } from 'react';
import { Badge } from './Badge';
import { DocumentCard } from './DocumentCard';
import { normalizeStatus } from '../utils/normalizeStatus';
import { getInitials } from '../utils/getInitials';
import { COLORS } from '../utils/constants';
import toast from 'react-hot-toast';

function SectionDivider({ icon, label, bg }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 14 }}>
      <div style={{ width: 28, height: 28, borderRadius: 8, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>{icon}</div>
      <div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--navy)', textTransform: 'uppercase', letterSpacing: '0.7px' }}>{label}</div>
      <div style={{ flex: 1, height: 1, background: 'var(--gray-200)' }} />
    </div>
  );
}

// ✅ Named export – exactly as imported in KYCReview
export function ReviewModal({ user, onClose, onApprove, onReject, canApproveReject }) {
  const [tab, setTab] = useState('details');
  const [rejectReasons, setRejectReasons] = useState({});
  const [processing, setProcessing] = useState({});

  if (!user) return null;

  // ─── User details ──────────────────────────────────────────────────────
  const name = user.fullName || user.name || user.userId?.name || 'Unknown';
  const userIdStr = user.userId?._id || user.userid || user._id || '';
  const email = user.userId?.email || user.email || '—';
  const mobile = user.userId?.mobile || user.mobile || '—';
  const status = normalizeStatus(user.status);
  const isFailed = status === 'Failed';
  const initials = user._initials || getInitials(name);
  const color = user._color || COLORS[0];
  const rejectionReason = user.rejectionReason;
  const reviewedAt = user.reviewedAt;
  const reviewedBy = user.reviewedBy?.name || user.reviewedBy?.email;

  // ─── Documents array ──────────────────────────────────────────────────
  let documents = user.documents || [];
  if (documents.length === 0) {
    const map = [
      { key: 'aadharFrontUrl', type: 'AADHAAR', label: 'Aadhaar (Front)' },
      { key: 'panCardUrl', type: 'PAN', label: 'PAN Card' },
      { key: 'passportUrl', type: 'PASSPORT', label: 'Passport' },
      { key: 'selfieUrl', type: 'SELFIE', label: 'Selfie' },
      { key: 'cancelChequeUrl', type: 'CANCEL_CHEQUE', label: 'Cancel Cheque' },
      { key: 'bankStatementUrl', type: 'BANK_STATEMENT', label: 'Bank Statement' },
      { key: 'passbookUrl', type: 'PASSBOOK', label: 'Passbook' },
    ];
    map.forEach(item => {
      const url = user[item.key] || user[item.key.replace('Url', '')];
      if (url) {
        documents.push({
          KYC_doc_id: `fallback_${item.key}`,
          document_type: item.type,
          front_image_url: url,
          status: user.status || 'Pending',
          Rejection_Reason: user.rejectionReason || 'Not Rejected',
        });
      }
    });
  }

  // ─── Handlers ────────────────────────────────────────────────────────────
  const handleApprove = async (KYC_doc_id) => {
    if (!canApproveReject) return;
    setProcessing(prev => ({ ...prev, [KYC_doc_id]: true }));
    try {
      await onApprove(KYC_doc_id);
    } catch (err) {
      // Error handled in hook
    } finally {
      setProcessing(prev => ({ ...prev, [KYC_doc_id]: false }));
    }
  };

  const handleReject = async (KYC_doc_id) => {
    if (!canApproveReject) return;
    const reason = rejectReasons[KYC_doc_id] || '';
    if (!reason.trim()) {
      toast.error('Please enter a rejection reason.');
      return;
    }
    setProcessing(prev => ({ ...prev, [KYC_doc_id]: true }));
    try {
      await onReject(KYC_doc_id, reason);
    } catch (err) {
      // Error handled in hook
    } finally {
      setProcessing(prev => ({ ...prev, [KYC_doc_id]: false }));
    }
  };

  const handleReasonChange = (KYC_doc_id, value) => {
    setRejectReasons(prev => ({ ...prev, [KYC_doc_id]: value }));
  };

  // ─── Status helpers ──────────────────────────────────────────────────────
  const getDocStatus = (doc) => {
    const s = doc.status || 'Pending';
    if (s === 'Approved') return 'Approved';
    if (s === 'Rejected') return 'Failed';
    if (s === 'under_review' || s === 'Under Review') return 'In Review';
    return s || 'Pending';
  };

  const isDocPending = (doc) => {
    const s = (doc.status || 'Pending').toLowerCase();
    return s !== 'approved' && s !== 'rejected' && s !== 'failed';
  };

  // ─── Group documents ──────────────────────────────────────────────────
  const grouped = {};
  documents.forEach(doc => {
    const type = doc.document_type || 'OTHER';
    if (!grouped[type]) grouped[type] = [];
    grouped[type].push(doc);
  });

  const docTypeIcons = {
    'AADHAAR': '🪪',
    'PAN': '💳',
    'PASSPORT': '📔',
    'SELFIE': '🤳',
    'BANK': '🏦',
    'BANK_STATEMENT': '📄',
    'CANCEL_CHEQUE': '🏦',
    'PASSBOOK': '📒',
  };

  const docTypeBg = {
    'AADHAAR': '#EFF6FF',
    'PAN': '#F5F3FF',
    'PASSPORT': '#FFF7ED',
    'SELFIE': '#F0FDF4',
    'BANK': '#FFFBEB',
    'BANK_STATEMENT': '#FFFBEB',
    'CANCEL_CHEQUE': '#FFFBEB',
    'PASSBOOK': '#FFFBEB',
  };

  const hasAnyDoc = documents.length > 0;

  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 860 }}>
        <div className="modal-head">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="avatar" style={{ background: color, width: 46, height: 46, borderRadius: 12, fontSize: 16 }}>{initials}</div>
            <div>
              <h3>{name}</h3>
              <div style={{ fontSize: 13, color: 'var(--gray-400)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>{String(userIdStr).slice(-10)}</span>
                <Badge status={status} />
              </div>
            </div>
          </div>
          <button className="btn btn-ghost icon-btn" onClick={onClose}>
            <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>

        <div className="modal-tabs">
          <button className={`mtab${tab === 'details' ? ' act' : ''}`} onClick={() => setTab('details')}>Details</button>
          <button className={`mtab${tab === 'documents' ? ' act' : ''}`} onClick={() => setTab('documents')}>Documents</button>
        </div>

        <div className="modal-body">
          {/* Details tab */}
          {tab === 'details' && (
            <>
              <div style={{ marginBottom: 20 }}>
                <div className="section-title">Personal Information</div>
                <div className="detail-grid">
                  {[
                    ['Full Name', name],
                    ['User ID', String(userIdStr).slice(-12)],
                    ['Email', email],
                    ['Mobile', mobile],
                    ['Submitted On', user.submitted_on || user.createdAt ? new Date(user.submitted_on || user.createdAt).toLocaleString('en-IN') : '—'],
                    ['Submission Count', user.submissionCount || 1],
                  ].map(([l, v]) => (
                    <div className="detail-item" key={l}><label>{l}</label><span>{v}</span></div>
                  ))}
                </div>
              </div>

              {(status === 'Approved' || status === 'Failed') && reviewedAt && (
                <div style={{ marginBottom: 16 }}>
                  <div className="section-title">Review Info</div>
                  <div className="detail-grid">
                    {[
                      ['Reviewed By', reviewedBy || 'Super Admin'],
                      ['Reviewed At', new Date(reviewedAt).toLocaleString('en-IN')],
                    ].map(([l, v]) => (
                      <div className="detail-item" key={l}><label>{l}</label><span>{v}</span></div>
                    ))}
                  </div>
                </div>
              )}

              {isFailed && rejectionReason && (
                <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: '12px 14px' }}>
                  <div style={{ fontSize: 10.5, fontWeight: 700, color: '#DC2626', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: 4 }}>Rejection Reason</div>
                  <div style={{ fontSize: 13, color: '#7F1D1D' }}>{rejectionReason}</div>
                </div>
              )}
            </>
          )}

          {/* Documents tab */}
          {tab === 'documents' && (
            <>
              {isFailed && (
                <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: '10px 14px', marginBottom: 14, fontSize: 13, color: '#991B1B', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>⚠️</span><span>This KYC was <strong>rejected</strong>. Review all documents carefully before re-approving.</span>
                </div>
              )}
              <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 10, padding: '10px 14px', marginBottom: 18, fontSize: 13, color: '#92400E', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>⚠️</span><span>Verify all documents are clear, legible, and belong to the same person. Click any document to open the full-size image.</span>
              </div>

              {!hasAnyDoc ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--gray-400)' }}>
                  <div style={{ fontSize: 32, marginBottom: 10 }}>📄</div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>No documents uploaded yet</div>
                  <div style={{ fontSize: 12, marginTop: 4 }}>This user has not submitted any KYC documents.</div>
                </div>
              ) : (
                Object.entries(grouped).map(([docType, docs]) => {
                  const icon = docTypeIcons[docType] || '📄';
                  const bg = docTypeBg[docType] || '#f8fafc';
                  const label = docType.charAt(0).toUpperCase() + docType.slice(1).toLowerCase();
                  return (
                    <div key={docType}>
                      <SectionDivider icon={icon} label={`${label} Documents`} bg={bg} />
                      {docs.map((doc) => {
                        const KYC_doc_id = doc.KYC_doc_id || doc._id;
                        if (!KYC_doc_id) return null;

                        const docStatus = getDocStatus(doc);
                        const isPending = isDocPending(doc);
                        const isProcessing = processing[KYC_doc_id] || false;
                        const reason = rejectReasons[KYC_doc_id] || '';
                        const isRejected = docStatus === 'Failed';
                        const isApproved = docStatus === 'Approved';

                        return (
                          <div
                            key={KYC_doc_id}
                            style={{
                              border: '1px solid #e5e7eb',
                              borderRadius: 8,
                              padding: 12,
                              marginBottom: 16,
                              background: '#fafafa',
                            }}
                          >
                            <DocumentCard
                              title={doc.document_type || docType}
                              emoji={icon}
                              url={doc.front_image_url}
                              accentColor="#3B82F6"
                              accentBg="#EFF6FF"
                              flagged={isRejected}
                            />

                            <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                              <div>
                                <span style={{ fontSize: 12, color: '#6b7280' }}>Status: </span>
                                <Badge status={docStatus} />
                                {doc.Rejection_Reason && doc.Rejection_Reason !== 'Not Rejected' && (
                                  <div style={{ fontSize: 11, color: '#dc2626', marginTop: 4 }}>
                                    Rejection reason: {doc.Rejection_Reason}
                                  </div>
                                )}
                              </div>

                              {canApproveReject && (
                                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                                  <input
                                    type="text"
                                    placeholder="Rejection reason"
                                    value={reason}
                                    onChange={(e) => handleReasonChange(KYC_doc_id, e.target.value)}
                                    style={{
                                      padding: '4px 8px',
                                      borderRadius: 4,
                                      border: '1px solid #d1d5db',
                                      fontSize: 12,
                                      width: 160,
                                    }}
                                    disabled={!isPending || isProcessing}
                                  />
                                  <button
                                    className="btn btn-success"
                                    onClick={() => handleApprove(KYC_doc_id)}
                                    disabled={!isPending || isProcessing}
                                    style={{
                                      padding: '5px 16px',
                                      background: '#059669',
                                      color: '#fff',
                                      border: 'none',
                                      borderRadius: 6,
                                      fontSize: 12,
                                      fontWeight: 600,
                                      cursor: (!isPending || isProcessing) ? 'not-allowed' : 'pointer',
                                      opacity: (!isPending || isProcessing) ? 0.5 : 1,
                                    }}
                                  >
                                    {isProcessing ? '...' : '✅ Approve'}
                                  </button>
                                  <button
                                    className="btn btn-danger"
                                    onClick={() => handleReject(KYC_doc_id)}
                                    disabled={!isPending || isProcessing}
                                    style={{
                                      padding: '5px 16px',
                                      background: '#dc2626',
                                      color: '#fff',
                                      border: 'none',
                                      borderRadius: 6,
                                      fontSize: 12,
                                      fontWeight: 600,
                                      cursor: (!isPending || isProcessing) ? 'not-allowed' : 'pointer',
                                      opacity: (!isPending || isProcessing) ? 0.5 : 1,
                                    }}
                                  >
                                    {isProcessing ? '...' : '❌ Reject'}
                                  </button>
                                  {!isPending && (
                                    <span style={{ fontSize: 11, color: '#6b7280' }}>
                                      (Document already {docStatus})
                                    </span>
                                  )}
                                </div>
                              )}

                              {!canApproveReject && (
                                <div style={{ fontSize: 12, color: '#6b7280' }}>
                                  No action allowed – contact admin for permissions
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })
              )}
            </>
          )}
        </div>

        <div className="modal-foot" style={{ justifyContent: 'flex-end' }}>
          <button className="btn btn-outline" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}