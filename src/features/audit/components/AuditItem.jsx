import { CONFIG } from '../utils/helpers';

export function AuditItem({ log }) {
  const type = log._type || 'info';
  const cfg = CONFIG[type] || CONFIG.info;
  const userName = log.userId?.name || '—';
  const userMob = log.userId?.mobile ? ` (${log.userId.mobile})` : '';
  const admin = log.reviewedBy?.name || log.reviewedBy?.email || 'Super Admin';
  const reason = log.rejectionReason || '';
  const timestamp = log.reviewedAt || '';
  const timeFormatted = timestamp
    ? new Date(timestamp).toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '—';

  return (
    <div className="audit-item">
      <div className="audit-icon" style={{ background: cfg.bg }}>{cfg.emoji}</div>
      <div style={{ flex: 1 }}>
        <div className="audit-act">{cfg.actionText}</div>
        <div className="audit-meta">
          User: <strong>{userName}{userMob}</strong> · Admin: <strong>{admin}</strong>
          {reason ? ` · Reason: ${reason}` : ''}
        </div>
      </div>
      <div className="audit-time">{timeFormatted}</div>
    </div>
  );
}