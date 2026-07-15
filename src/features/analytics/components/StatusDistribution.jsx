export function StatusDistribution({ data, loading }) {
  const { approved = 0, pending = 0, rejected = 0, total = 1 } = data || {};

  const dist = [
    { label: 'Approved', value: approved, total, color: '#10B981', bg: '#F0FDF4' },
    { label: 'Pending', value: pending, total, color: '#F59E0B', bg: '#FFFBEB' },
    { label: 'Failed', value: rejected, total, color: '#EF4444', bg: '#FEF2F2' },
  ];

  return (
    <>
      {dist.map(d => {
        const pct = d.total > 0 ? ((d.value / d.total) * 100).toFixed(1) : '0.0';
        return (
          <div key={d.label}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 600, color: 'var(--navy)', marginBottom: 6 }}>
              <span>{d.label}</span>
              <span>{loading ? '—' : `${d.value.toLocaleString()} (${pct}%)`}</span>
            </div>
            <div style={{ height: 8, background: 'var(--gray-100)', borderRadius: 20, overflow: 'hidden' }}>
              {!loading && (
                <div style={{
                  height: '100%',
                  width: `${pct}%`,
                  background: d.color,
                  borderRadius: 20,
                  transition: 'width 0.6s ease',
                }} />
              )}
            </div>
          </div>
        );
      })}
    </>
  );
}