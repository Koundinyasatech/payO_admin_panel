// src/features/kyc/components/RejectModal.jsx
export function RejectModal({ targetId, reason, setReason, onConfirm, onCancel }) {
  return (
    <div className="overlay" onClick={e=>e.target===e.currentTarget&&onCancel()}>
      <div className="modal" style={{ maxWidth:420 }}>
        <div className="modal-head">
          <h3>Reject KYC</h3>
          <button className="btn btn-ghost icon-btn" onClick={onCancel}>
            <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div className="modal-body">
          <p style={{ fontSize:13.5, color:'var(--gray-600)', marginBottom:16, lineHeight:1.6 }}>
            Provide a clear reason so the user knows what to fix before resubmitting.
          </p>
          <textarea rows={4} placeholder="e.g. Aadhaar & PAN name mismatch, selfie is blurry..." value={reason} onChange={e=>setReason(e.target.value)} autoFocus/>
          {!reason.trim() && <div style={{ fontSize:11.5, color:'var(--gray-400)', marginTop:6 }}>⚠️ Reason is required before rejecting.</div>}
        </div>
        <div className="modal-foot">
          <button className="btn btn-outline" onClick={onCancel}>Cancel</button>
          <button className="btn btn-danger" onClick={onConfirm} disabled={!reason.trim()} style={{ opacity:reason.trim()?1:0.5 }}>❌ Reject KYC</button>
        </div>
      </div>
    </div>
  );
}