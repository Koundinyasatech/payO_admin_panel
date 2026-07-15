import { getAllSubmissions, approveKYC, rejectKYC } from '../../../api/kyc.api';
import { useState, useEffect } from 'react';
import { Badge } from './Badge';
import { DocumentCard } from './DocumentCard';
import { getSubmissionDetails } from '../../../api/kyc.api';
import { normalizeStatus } from '../utils/normalizeStatus';
import { getInitials } from '../utils/getInitials';
import { COLORS } from '../utils/constants';

function SectionDivider({ icon, label, bg }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:9, marginBottom:14 }}>
      <div style={{ width:28, height:28, borderRadius:8, background:bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, flexShrink:0 }}>{icon}</div>
      <div style={{ fontSize:11.5, fontWeight:700, color:'var(--navy)', textTransform:'uppercase', letterSpacing:'0.7px' }}>{label}</div>
      <div style={{ flex:1, height:1, background:'var(--gray-200)' }}/>
    </div>
  );
}

export function ReviewModal({ user, onClose, onApprove, onReject, canApproveReject }) {
  const [tab, setTab] = useState('details');
  const [reason, setReason] = useState('');
  const [detailLoading, setDetailLoading] = useState(false);
  const [details, setDetails] = useState(null);

  useEffect(() => {
    if (!user) return;
    const kycId = user._id;
    if (!kycId) return;
    setDetailLoading(true);
    getSubmissionDetails(kycId)
      .then(res => {
        const d = res.data?.kyc || {};
        setDetails(d);
      })
      .catch(() => {})
      .finally(() => setDetailLoading(false));
  }, [user]);

  if (!user) return null;

  const src = details || user;
  const name      = src.fullName || src.userId?.name || 'Unknown';
  const userIdStr = src.userId?._id || src.userId || '';
  const email     = src.userId?.email || '—';
  const mobile    = src.userId?.mobile || '—';
  const status    = normalizeStatus(src.status);
  const isFailed  = status === 'Failed';
  const initials  = user._initials || getInitials(name);
  const color     = user._color || COLORS[0];
  const rejectionReason = src.rejectionReason;
  const reviewedAt      = src.reviewedAt;
  const reviewedBy      = src.reviewedBy?.name || src.reviewedBy?.email;

  const aadhar        = src.aadharFrontUrl;
  const pan           = src.panCardUrl;
  const passport      = src.passportUrl;
  const selfie        = src.selfieUrl;
  const cancelCheque  = src.cancelChequeUrl || src.cancelledChequeUrl;
  const bankStatement = src.bankStatementUrl || src.statementUrl;
  const passbook      = src.passbookUrl;

  const hasAnyDoc = !!(aadhar || pan || passport || selfie || cancelCheque || bankStatement || passbook);

  // (the JSX is the same as original, with class names and inline styles)
  // I'll paste the JSX here (same as provided)
  return (
    <div className="overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal" style={{ maxWidth:860 }}>
        <div className="modal-head">
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div className="avatar" style={{ background:color, width:46, height:46, borderRadius:12, fontSize:16 }}>{initials}</div>
            <div>
              <h3>{name}</h3>
              <div style={{ fontSize:13, color:'var(--gray-400)', marginTop:2, display:'flex', alignItems:'center', gap:8 }}>
                <span>{String(userIdStr).slice(-10)}</span>
                <Badge status={status}/>
              </div>
            </div>
          </div>
          <button className="btn btn-ghost icon-btn" onClick={onClose}>
            <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div className="modal-tabs">
          {[['details','Details'],['documents','Documents'],canApproveReject && ['action','Take Action']].filter(Boolean).map(([key,label]) => (
            <button key={key} className={`mtab${tab===key?' act':''}`} onClick={()=>setTab(key)}>{label}</button>
          ))}
        </div>

        <div className="modal-body">
          {detailLoading && (
            <div style={{ padding:'32px', textAlign:'center', color:'var(--gray-400)', fontSize:14 }}>
              <div style={{ width:28, height:28, border:'3px solid var(--gray-200)', borderTopColor:'#3B82F6', borderRadius:'50%', animation:'spin 0.8s linear infinite', margin:'0 auto 12px' }}/>
              Loading details...
              <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            </div>
          )}

          {!detailLoading && tab === 'details' && (
            <>
              <div style={{ marginBottom:20 }}>
                <div className="section-title">Personal Information</div>
                <div className="detail-grid">
                  {[
                    ['Full Name', name],
                    ['User ID', String(userIdStr).slice(-12)],
                    ['Email', email],
                    ['Mobile', mobile],
                    ['Submitted On', src.createdAt ? new Date(src.createdAt).toLocaleString('en-IN') : '—'],
                    ['Submission Count', src.submissionCount || 1],
                  ].map(([l,v]) => (
                    <div className="detail-item" key={l}><label>{l}</label><span>{v}</span></div>
                  ))}
                </div>
              </div>

              {(status === 'Approved' || status === 'Failed') && reviewedAt && (
                <div style={{ marginBottom:16 }}>
                  <div className="section-title">Review Info</div>
                  <div className="detail-grid">
                    {[
                      ['Reviewed By', reviewedBy || 'Super Admin'],
                      ['Reviewed At', new Date(reviewedAt).toLocaleString('en-IN')],
                    ].map(([l,v]) => (
                      <div className="detail-item" key={l}><label>{l}</label><span>{v}</span></div>
                    ))}
                  </div>
                </div>
              )}

              {isFailed && rejectionReason && (
                <div style={{ background:'#FEF2F2', border:'1px solid #FECACA', borderRadius:10, padding:'12px 14px' }}>
                  <div style={{ fontSize:10.5, fontWeight:700, color:'#DC2626', letterSpacing:'0.5px', textTransform:'uppercase', marginBottom:4 }}>Rejection Reason</div>
                  <div style={{ fontSize:13, color:'#7F1D1D' }}>{rejectionReason}</div>
                </div>
              )}
            </>
          )}

          {!detailLoading && tab === 'documents' && (
            <>
              {isFailed && (
                <div style={{ background:'#FEF2F2', border:'1px solid #FECACA', borderRadius:10, padding:'10px 14px', marginBottom:14, fontSize:13, color:'#991B1B', display:'flex', alignItems:'center', gap:8 }}>
                  <span>⚠️</span><span>This KYC was <strong>rejected</strong>. Review all documents carefully before re-approving.</span>
                </div>
              )}
              <div style={{ background:'#FFFBEB', border:'1px solid #FDE68A', borderRadius:10, padding:'10px 14px', marginBottom:18, fontSize:13, color:'#92400E', display:'flex', alignItems:'center', gap:8 }}>
                <span>⚠️</span><span>Verify all documents are clear, legible, and belong to the same person. Click any document to open the full-size image.</span>
              </div>

              {hasAnyDoc ? (
                <>
                  <div style={{ marginBottom:20 }}>
                    <SectionDivider icon="🪪" label="Identity Documents" bg="#EFF6FF"/>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                      <DocumentCard
                        title="Aadhaar Card (Front)"
                        emoji="🪪"
                        url={aadhar}
                        accentColor="#3B82F6"
                        accentBg="linear-gradient(135deg,#EFF6FF,#DBEAFE)"
                        flagged={isFailed}
                      />
                      <DocumentCard
                        title="PAN Card"
                        emoji="💳"
                        url={pan}
                        accentColor="#8B5CF6"
                        accentBg="linear-gradient(135deg,#F5F3FF,#EDE9FE)"
                        flagged={isFailed}
                      />
                    </div>
                  </div>

                  {passport && (
                    <div style={{ marginBottom:20 }}>
                      <SectionDivider icon="📔" label="Passport" bg="#FFF7ED"/>
                      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                        <DocumentCard
                          title="Passport"
                          emoji="📔"
                          url={passport}
                          accentColor="#F97316"
                          accentBg="linear-gradient(135deg,#FFF7ED,#FFEDD5)"
                          flagged={isFailed}
                        />
                      </div>
                    </div>
                  )}

                  <div style={{ marginBottom:20 }}>
                    <SectionDivider icon="🤳" label="Live Selfie" bg="#F0FDF4"/>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                      <DocumentCard
                        title="Live Selfie"
                        emoji="🤳"
                        url={selfie}
                        accentColor="#10B981"
                        accentBg="linear-gradient(135deg,#F0FDF4,#ECFDF5)"
                        flagged={isFailed}
                      />
                    </div>
                  </div>

                  {(cancelCheque || bankStatement || passbook) && (
                    <div style={{ marginBottom:20 }}>
                      <SectionDivider icon="🏦" label="Bank Documents" bg="#FFFBEB"/>
                      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:14 }}>
                        <DocumentCard
                          title="Cancel Cheque"
                          emoji="🏦"
                          url={cancelCheque}
                          accentColor="#3B82F6"
                          accentBg="linear-gradient(135deg,#EFF6FF,#DBEAFE)"
                          flagged={isFailed}
                        />
                        <DocumentCard
                          title="Bank Statement"
                          emoji="📄"
                          url={bankStatement}
                          accentColor="#8B5CF6"
                          accentBg="linear-gradient(135deg,#F5F3FF,#EDE9FE)"
                          flagged={isFailed}
                        />
                        <DocumentCard
                          title="Passbook"
                          emoji="📒"
                          url={passbook}
                          accentColor="#F59E0B"
                          accentBg="linear-gradient(135deg,#FFFBEB,#FEF3C7)"
                          flagged={isFailed}
                        />
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div style={{ textAlign:'center', padding:'40px 20px', color:'var(--gray-400)' }}>
                  <div style={{ fontSize:32, marginBottom:10 }}>📄</div>
                  <div style={{ fontSize:14, fontWeight:600 }}>No documents uploaded yet</div>
                  <div style={{ fontSize:12, marginTop:4 }}>This user has not submitted any KYC documents.</div>
                </div>
              )}
            </>
          )}

          {!detailLoading && tab === 'action' && (
            <>
              <div style={{ background:'#F8FAFC', borderRadius:12, padding:'14px 16px', marginBottom:20, border:'1px solid var(--gray-200)' }}>
                <div style={{ fontSize:12, fontWeight:600, color:'var(--navy)', marginBottom:6 }}>Current Status</div>
                <Badge status={status}/>
                {status !== 'In Review' && (
                  <div style={{ fontSize:12, color:'var(--gray-400)', marginTop:8 }}>
                    ℹ️ Backend only allows approve/reject on records with status <code>under_review</code>.
                  </div>
                )}
              </div>
              <div style={{ marginBottom:20 }}>
                <div className="section-title">Approve KYC</div>
                <p style={{ fontSize:13, color:'var(--gray-600)', marginBottom:12, lineHeight:1.5 }}>Approving will activate the user's wallet and allow them to send/receive PYO tokens.</p>
                <button
                  className="btn btn-success"
                  style={{ width:'100%', padding:'11px', fontSize:13, opacity: status === 'In Review' ? 1 : 0.5 }}
                  disabled={status !== 'In Review'}
                  onClick={()=>onApprove(user._id)}>
                  ✅ Approve KYC & Activate Wallet
                </button>
              </div>
              <div style={{ border:'1px solid var(--gray-200)', borderRadius:12, padding:'16px' }}>
                <div className="section-title">Reject KYC</div>
                <p style={{ fontSize:13, color:'var(--gray-600)', marginBottom:10 }}>Provide a clear reason so the user knows what to fix:</p>
                <textarea rows={3} placeholder="e.g. Aadhaar & PAN name mismatch, selfie unclear..." value={reason} onChange={e=>setReason(e.target.value)}/>
                <button
                  className="btn btn-danger"
                  style={{ width:'100%', padding:'11px', fontSize:13, marginTop:10, opacity: (reason.trim() && status === 'In Review') ? 1 : 0.5 }}
                  disabled={status !== 'In Review'}
                  onClick={()=>{if(reason.trim())onReject(user._id, reason);}}>
                  ❌ Reject KYC
                </button>
                {!reason.trim() && status === 'In Review' && <div style={{ fontSize:11, color:'var(--gray-400)', marginTop:5, textAlign:'center' }}>Enter a rejection reason first</div>}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}