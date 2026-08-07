import { useState, useRef, useEffect } from 'react';
import { DATE_OPTS } from '../utils/helpers';

export function DateDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);
  const selected = DATE_OPTS.find(o => o.value === value) || DATE_OPTS[0];
  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: 7,
          padding: '8px 14px', borderRadius: 9,
          background: open ? '#EEF2FF' : 'var(--filter-btn-bg,#F5F3FF)',
          border: '1.5px solid var(--filter-btn-border,#C7D2FE)',
          color: 'var(--filter-btn-color,#4F46E5)',
          fontSize: 13, fontWeight: 600, cursor: 'pointer',
          fontFamily: "'Inter',sans-serif", whiteSpace: 'nowrap',
        }}
      >
        <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
        {selected.label}
        {value !== 'all' && (
          <span style={{ background: '#4F46E5', color: '#fff', borderRadius: 20, padding: '1px 6px', fontSize: 10, fontWeight: 700 }}>1</span>
        )}
        <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"
          style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.18s' }}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', left: 0,
          background: 'var(--dropdown-bg,#fff)', border: '1.5px solid var(--dropdown-border,#E2E8F0)',
          borderRadius: 12, padding: 6, minWidth: 175,
          boxShadow: '0 12px 40px rgba(0,0,0,0.12)', zIndex: 500,
        }}>
          {DATE_OPTS.map(opt => (
            <div
              key={opt.value}
              onClick={() => { onChange(opt.value); setOpen(false); }}
              style={{
                padding: '9px 12px', borderRadius: 8, fontSize: 13, cursor: 'pointer',
                fontWeight: value === opt.value ? 600 : 400,
                color: value === opt.value ? '#4F46E5' : 'var(--dropdown-text,#374151)',
                background: value === opt.value ? '#EEF2FF' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}
              onMouseEnter={e => { if (value !== opt.value) e.currentTarget.style.background = 'var(--dropdown-hover,#F9FAFB)'; }}
              onMouseLeave={e => { if (value !== opt.value) e.currentTarget.style.background = 'transparent'; }}
            >
              {opt.label}
              {value === opt.value && (
                <svg width="13" height="13" fill="none" stroke="#4F46E5" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>
              )}
            </div>
          ))}
          {value !== 'all' && (
            <div style={{ borderTop: '1px solid var(--dropdown-border,#E2E8F0)', marginTop: 4, paddingTop: 4 }}>
              <div
                onClick={() => { onChange('all'); setOpen(false); }}
                style={{ padding: '8px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, color: '#EF4444', cursor: 'pointer', textAlign: 'center' }}
                onMouseEnter={e => e.currentTarget.style.background = '#FEF2F2'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                Clear filter
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}