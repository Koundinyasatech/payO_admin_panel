export function FilterTabs({ current, unreadCount, onChange }) {
  const tabs = ['All', 'Unread', 'Read', 'KYC', 'System'];

  return (
    <div className="notif-tabs">
      {tabs.map(tab => {
        const label = tab === 'Unread' && unreadCount > 0
          ? `${tab} (${unreadCount})`
          : tab;
        return (
          <button
            key={tab}
            className={`ntab${current === tab ? ' act' : ''}`}
            onClick={() => onChange(tab)}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}