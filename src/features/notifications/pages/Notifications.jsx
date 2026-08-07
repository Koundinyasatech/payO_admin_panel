import { useNotifications } from '../hooks/useNotifications';
import { Skeleton } from '../components/Skeleton';
import { FilterTabs } from '../components/FilterTabs';
import { NotificationItem } from '../components/NotificationItem';

export default function Notifications() {
  const {
    loading,
    filter,
    unreadCount,
    filtered,
    setFilter,
    markAllRead,
    markOneRead,
    deleteOne,
  } = useNotifications();

  return (
    <div className="page">
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>

      <div className="page-header">
        <div className="page-header-left">
          <h2>Notifications</h2>
          <p>{loading ? '...' : `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}.`}</p>
        </div>
        {unreadCount > 0 && (
          <button className="btn btn-outline" onClick={markAllRead}>
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Mark All Read
          </button>
        )}
      </div>

      <FilterTabs current={filter} unreadCount={unreadCount} onChange={setFilter} />

      <div className="card">
        {loading ? (
          <div style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            {Array(5).fill(0).map((_, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <Skeleton w={44} h={44} radius={10} />
                <div style={{ flex: 1 }}>
                  <Skeleton w="50%" h={13} radius={4} style={{ marginBottom: 6 }} />
                  <Skeleton w="70%" h={10} radius={4} />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty">No notifications here.</div>
        ) : (
          <div>
            {filtered.map(n => (
              <NotificationItem
                key={n.id}
                notification={n}
                onMarkRead={markOneRead}
                onDelete={deleteOne}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}