import { TYPE_CONFIG } from '../utils/helpers';

export function NotificationItem({ notification, onMarkRead, onDelete }) {
  const { id, type, title, message, time, read } = notification;
  const config = TYPE_CONFIG[type] || TYPE_CONFIG.system;

  return (
    <div
      className={`notif-item${!read ? ' unread' : ''}`}
      onClick={() => onMarkRead(id)}
    >
      <div className="notif-icon" style={{ background: config.bg }}>
        {config.emoji}
      </div>
      <div style={{ flex: 1 }}>
        <div className="notif-title">{title}</div>
        <div className="notif-msg">{message}</div>
        <div className="notif-time">{time}</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
        {!read && <div className="unread-dot" />}
        <button
          className="btn btn-ghost icon-btn"
          style={{ width: 28, height: 28 }}
          onClick={e => { e.stopPropagation(); onDelete(id); }}
        >
          <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </div>
  );
}