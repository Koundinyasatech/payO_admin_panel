// src/features/kyc/components/KYCTable.jsx
import { Badge } from './Badge';
import { SkeletonRow } from './SkeletonRow';

export function KYCTable({ data, loading, onReview, onApprove, onReject, canApproveReject }) {
  if (loading) {
    return (
      <tbody>
        {Array(6).fill(0).map((_, i) => (
          <tr key={i}>
            <td><div style={{ display:'flex', alignItems:'center', gap:10 }}><SkeletonRow w={34} h={34} radius={8}/><div><SkeletonRow w={120} h={12} radius={4} style={{ marginBottom:4 }}/><SkeletonRow w={80} h={10} radius={4}/></div></div></td>
            <td><div style={{ display:'flex', gap:4 }}><SkeletonRow w={60} h={20} radius={20}/><SkeletonRow w={50} h={20} radius={20}/><SkeletonRow w={55} h={20} radius={20}/></div></td>
            <td><SkeletonRow w={100} h={12} radius={4}/></td>
            <td><SkeletonRow w={70} h={22} radius={20}/></td>
            <td><SkeletonRow w={80} h={28} radius={8}/></td>
          </tr>
        ))}
      </tbody>
    );
  }

  return (
    <tbody>
      {data.map(r => {
        const name      = r.fullName || r.userId?.name || 'Unknown';
        const userIdStr = r._id || '';
        const mobile    = r.userId?.mobile || '';
        const status    = r._normalStatus;
        const initials  = r._initials;
        const color     = r._color;
        const dateStr   = r.createdAt || '';
        const formatted = dateStr ? new Date(dateStr).toLocaleString('en-IN', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' }) : '—';
        const docs = [];
        if (r.aadharFrontUrl)    docs.push('🪪 Aadhaar');
        if (r.panCardUrl)        docs.push('💳 PAN');
        if (r.passportUrl)       docs.push('📔 Passport');
        if (r.selfieUrl)         docs.push('🤳 Selfie');
        if (r.cancelChequeUrl || r.cancelledChequeUrl)  docs.push('🏦 Cheque');
        if (r.bankStatementUrl || r.statementUrl)        docs.push('📄 Statement');
        if (r.passbookUrl)       docs.push('📒 Passbook');

        return (
          <tr key={r._id}>
            <td>
              <div className="user-cell">
                <div className="avatar" style={{ background:color }}>{initials}</div>
                <div>
                  <div className="uname">{name}</div>
                  <div className="uid">{mobile || String(userIdStr).slice(-10)}</div>
                </div>
              </div>
            </td>
            <td>
              <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
                {docs.length === 0
                  ? <span style={{ fontSize:12, color:'var(--gray-400)' }}>—</span>
                  : docs.map(d => <span key={d} className="doc-badge">{d}</span>)}
              </div>
            </td>
            <td style={{ color:'var(--gray-400)', fontSize:13 }}>{formatted}</td>
            <td><Badge status={status}/></td>
            <td>
              <div className="act-group">
                <button className="btn btn-outline" style={{ fontSize:12, padding:'5px 11px' }} onClick={()=>onReview(r)}>👁 Review</button>
                {canApproveReject && status === 'In Review' && <>
                  <button className="btn btn-ghost icon-btn" title="Approve" onClick={()=>onApprove(r._id)} style={{ color:'var(--green)' }}>
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                  </button>
                  <button className="btn btn-ghost icon-btn" title="Reject" onClick={()=>onReject(r._id)} style={{ color:'var(--red)' }}>
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </>}
              </div>
            </td>
          </tr>
        );
      })}
    </tbody>
  );
}