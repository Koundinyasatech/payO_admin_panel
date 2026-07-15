export function StatsSummary({ totals, loading }) {
  const items = [
    { label: 'Total', val: totals.total, color: '#2563EB', bg: '#EFF6FF' },
    { label: 'Verified', val: totals.verified, color: '#059669', bg: '#F0FDF4' },
    { label: 'Pending', val: totals.pending, color: '#D97706', bg: '#FFFBEB' },
  ];
  return (
    <div style={{ display: 'flex', gap: 10 }}>
      {items.map(s => (
        <div key={s.label} style={{ background: s.bg, border: `1.5px solid ${s.color}33`, borderRadius: 10, padding: '9px 16px', minWidth: 70, textAlign: 'center' }}>
          <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 18, fontWeight: 800, color: s.color }}>
            {loading ? '—' : s.val.toLocaleString()}
          </div>
          <div style={{ fontSize: 11, color: s.color, fontWeight: 600, opacity: 0.8 }}>{s.label}</div>
        </div>
      ))}
    </div>
  );
}