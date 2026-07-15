import { Skeleton } from './Skeleton';

export function BarChart({ data, loading }) {
  const H = 160;
  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: H, padding: '0 10px', marginTop: 16 }}>
        {Array(6).fill(0).map((_, i) => (
          <Skeleton key={i} w={40} h={Math.random() * H * 0.8 + H * 0.2} radius={6} style={{ flexShrink: 0 }} />
        ))}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return <div className="empty" style={{ marginTop: 16 }}>No monthly data available yet.</div>;
  }

  const maxVal = Math.max(...data.map(d => d.approved + d.pending + d.rejected), 1);

  return (
    <>
      <div className="bar-wrap">
        {data.map(d => {
          const ah = Math.round((d.approved / maxVal) * H);
          const ph = Math.round((d.pending / maxVal) * H);
          const rh = Math.round((d.rejected / maxVal) * H);
          return (
            <div className="bar-group" key={d.month}>
              <div className="bar-stack">
                <div className="bar-seg" style={{ height: ah, background: '#10B981' }} title={`Approved: ${d.approved}`} />
                <div className="bar-seg" style={{ height: ph, background: '#F59E0B' }} title={`Pending: ${d.pending}`} />
                <div className="bar-seg" style={{ height: rh, background: '#EF4444' }} title={`Rejected: ${d.rejected}`} />
              </div>
              <div className="bar-label">{d.month}</div>
            </div>
          );
        })}
      </div>
      <div style={{ display: 'flex', gap: 14, marginTop: 12, justifyContent: 'center' }}>
        {[
          ['#10B981', 'Approved'],
          ['#F59E0B', 'Pending'],
          ['#EF4444', 'Rejected'],
        ].map(([c, l]) => (
          <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--gray-600)' }}>
            <div style={{ width: 10, height: 10, borderRadius: 3, background: c }} />
            {l}
          </div>
        ))}
      </div>
    </>
  );
}