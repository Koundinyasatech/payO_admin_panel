// src/features/kyc/components/KYCTable.jsx
import { Badge } from './Badge';
import { SkeletonRow } from './SkeletonRow';

export function KYCTable({ data, loading, onReview }) {
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
        const name = r.fullName || r.name || r.userId?.name || 'Unknown';
        const userIdStr = r.userId?._id || r.userid || '';
        const mobile = r.userId?.mobile || r.mobile || '';
        const status = r._normalStatus;
        const initials = r._initials;
        const color = r._color;
        const dateStr = r.submitted_on || r.createdAt || '';
        const formatted = dateStr ? new Date(dateStr).toLocaleString('en-IN', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' }) : '—';

        // ─── Build document badges from the documents array ──────────
        const docs = (r.documents || []).map(d => {
          const emojiMap = {
            'AADHAAR': '🪪',
            'PAN': '💳',
            'PASSPORT': '📔',
            'SELFIE': '🤳',
            'BANK': '🏦',
            'CANCEL_CHEQUE': '🏦',
            'BANK_STATEMENT': '📄',
            'PASSBOOK': '📒',
          };
          const emoji = emojiMap[d.document_type] || '📄';
          return `${emoji} ${d.document_type}`;
        });

        // ─── Preview – first document URL ───────────────────────────
        const firstDoc = (r.documents || [])[0];
        const firstDocUrl = firstDoc?.front_image_url || null;

        return (
          <tr key={r._id || r.userid}>
            <td>
              <div className="user-cell">
                <div className="avatar" style={{ background: color }}>{initials}</div>
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
              <div className="act-group" style={{ display: 'flex', gap: 6 }}>
                {firstDocUrl && (
                  <button
                    className="btn btn-ghost icon-btn"
                    title="Preview document"
                    onClick={() => window.open(firstDocUrl, '_blank')}
                    style={{ fontSize: 14 }}
                  >
                    👁
                  </button>
                )}
                <button
                  className="btn btn-outline"
                  style={{ fontSize:12, padding:'5px 11px' }}
                  onClick={() => onReview(r)}
                >
                  📋 Review
                </button>
              </div>
            </td>
          </tr>
        );
      })}
    </tbody>
  );
}