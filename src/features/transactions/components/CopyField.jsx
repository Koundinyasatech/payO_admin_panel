import { truncateWallet } from '../utils/helpers';

export function CopyField({ val, copyId, copied, onCopy, truncate = false }) {
  if (!val || val === '—') return <span style={{ fontSize: 13, color: 'var(--gray-400)' }}>—</span>;
  const display = truncate ? truncateWallet(val) : val;
  const ok = copied === copyId;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
      <span style={{ fontFamily: 'monospace', fontSize: 12.5, color: 'var(--navy)', userSelect: 'text' }} title={val}>
        {display}
      </span>
      <button
        onClick={e => { e.stopPropagation(); onCopy(val, copyId); }}
        title="Copy"
        style={{
          flexShrink: 0, width: 24, height: 24, borderRadius: 7,
          border: `1.5px solid ${ok ? '#86EFAC' : 'var(--gray-200)'}`,
          background: ok ? '#F0FDF4' : 'var(--gray-100,#F1F5F9)',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.15s',
        }}
      >
        {ok
          ? <svg width="10" height="10" fill="none" stroke="#059669" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>
          : <svg width="10" height="10" fill="none" stroke="var(--gray-400)" strokeWidth="2" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" /></svg>
        }
      </button>
    </div>
  );
}