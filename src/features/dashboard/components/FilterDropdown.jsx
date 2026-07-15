import { useState, useRef, useEffect } from 'react';

export function FilterDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const options = [
    { label: 'All Dates',    value: 'all' },
    { label: 'Today',        value: 'today' },
    { label: 'Yesterday',    value: 'yesterday' },
    { label: 'Last 7 Days',  value: '7days' },
    { label: 'Last 30 Days', value: '30days' },
    { label: 'This Month',   value: 'month' },
    { label: 'Last Month',   value: 'lastmonth' },
  ];
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);
  // Removed unused 'selected' variable

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button onClick={() => setOpen(o => !o)} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '7px 14px', background: open ? '#EEF2FF' : 'var(--filter-btn-bg, #F5F3FF)', border: '1.5px solid var(--filter-btn-border, #C7D2FE)', borderRadius: 10, color: 'var(--filter-btn-color, #4F46E5)', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: "'Inter',sans-serif", transition: 'all 0.18s', whiteSpace: 'nowrap' }}>
        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></svg>
        Filters
        {value !== 'all' && <span style={{ background: '#4F46E5', color: '#fff', borderRadius: 20, padding: '1px 6px', fontSize: 10, fontWeight: 700 }}>1</span>}
        <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" style={{ transition: 'transform 0.18s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}><polyline points="6 9 12 15 18 9" /></svg>
      </button>
      {open && (
        <div style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, background: 'var(--dropdown-bg, #fff)', border: '1.5px solid var(--dropdown-border, #E2E8F0)', borderRadius: 12, padding: '6px', minWidth: 180, boxShadow: '0 8px 32px rgba(0,0,0,0.12)', zIndex: 500 }}>
          {options.map(opt => (
            <div key={opt.value} onClick={() => { onChange(opt.value); setOpen(false); }}
              style={{ padding: '9px 12px', borderRadius: 8, fontSize: 13, fontWeight: value === opt.value ? 600 : 400, color: value === opt.value ? '#4F46E5' : 'var(--dropdown-text, #374151)', background: value === opt.value ? '#EEF2FF' : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
              onMouseEnter={e => { if (value !== opt.value) e.currentTarget.style.background = 'var(--dropdown-hover, #F9FAFB)'; }}
              onMouseLeave={e => { if (value !== opt.value) e.currentTarget.style.background = 'transparent'; }}>
              {opt.label}
              {value === opt.value && <svg width="14" height="14" fill="none" stroke="#4F46E5" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>}
            </div>
          ))}
          {value !== 'all' && (
            <div style={{ borderTop: '1px solid var(--dropdown-border, #E2E8F0)', marginTop: 4, paddingTop: 4 }}>
              <div onClick={() => { onChange('all'); setOpen(false); }} style={{ padding: '8px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, color: '#EF4444', cursor: 'pointer', textAlign: 'center' }} onMouseEnter={e => e.currentTarget.style.background = '#FEF2F2'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>Clear Filter</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}