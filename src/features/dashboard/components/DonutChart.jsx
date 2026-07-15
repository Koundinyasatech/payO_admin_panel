import { Skeleton } from './Skeleton';

export function DonutChart({ stats }) {
  if (!stats) return <Skeleton h={176} radius={88} style={{ margin: '0 auto' }} />;
  const total    = stats.total    || 1;
  const approved = stats.approved || 0;
  const pending  = stats.pending  || 0;
  const rejected = stats.rejected || 0;
  const r = 68, cx = 88, cy = 88, sw = 18;
  const c = 2 * Math.PI * r;
  const aPct = approved / total;
  const pPct = pending  / total;
  const successRate = total > 0 ? ((approved / total) * 100).toFixed(1) : '0.0';
  return (
    <div className="donut-wrap">
      <div style={{ position: 'relative', display: 'inline-block' }}>
        <svg width="176" height="176" viewBox="0 0 176 176">
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#FEE2E2" strokeWidth={sw} />
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#FEF3C7" strokeWidth={sw}
            strokeDasharray={`${(aPct + pPct) * c} ${c}`} strokeDashoffset={-aPct * c} strokeLinecap="round"
            transform={`rotate(-90 ${cx} ${cy})`} />
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#10B981" strokeWidth={sw}
            strokeDasharray={`${aPct * c} ${c}`} strokeLinecap="round"
            transform={`rotate(-90 ${cx} ${cy})`} />
        </svg>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center' }}>
          <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 21, fontWeight: 800, color: 'var(--navy)' }}>{successRate}%</div>
          <div style={{ fontSize: 10, color: 'var(--gray-400)', fontWeight: 600 }}>Success Rate</div>
        </div>
      </div>
      <div className="donut-legend">
        {[['#10B981', 'Approved', `${approved.toLocaleString()} (${successRate}%)`], ['#F59E0B', 'Pending', `${pending.toLocaleString()}`], ['#EF4444', 'Rejected', `${rejected.toLocaleString()}`]].map(([col, l, v]) => (
          <div className="legend-row" key={l}>
            <div className="l-label"><div className="l-dot" style={{ background: col }} />{l}</div>
            <div className="l-val">{v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}