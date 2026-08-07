import { CONFIG } from '../utils/helpers';

export function FilterChips({ current, counts, onChange }) {
  const items = [
    { key: 'All', label: 'All', count: counts.All, emoji: '📋' },
    { key: 'approve', label: 'Approve', count: counts.approve, emoji: CONFIG.approve.emoji },
    { key: 'reject', label: 'Reject', count: counts.reject, emoji: CONFIG.reject.emoji },
    { key: 'info', label: 'Info', count: counts.info, emoji: CONFIG.info.emoji },
  ];

  return (
    <div className="chip-row">
      {items.map(({ key, label, count, emoji }) => (
        <div
          key={key}
          className={`chip${current === key ? ' act' : ''}`}
          onClick={() => onChange(key)}
        >
          {emoji} {label}
          <span className="chip-count">{count}</span>
        </div>
      ))}
    </div>
  );
}