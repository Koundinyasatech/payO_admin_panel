import { Skeleton } from './Skeleton';

export function KPICard({ label, value, change, up, emoji, bg, loading }) {
  return (
    <div className="stat-card">
      <div className="stat-top">
        <div>
          <div className="stat-label">{label}</div>
          {loading ? (
            <Skeleton w={80} h={24} radius={6} style={{ marginTop: 6, marginBottom: 4 }} />
          ) : (
            <div className="stat-value" style={{ fontSize: 20 }}>{value}</div>
          )}
          <div className={`stat-change ${up ? 'up' : 'down'}`} style={{ fontSize: 11 }}>
            {change}
          </div>
        </div>
        <div className="stat-icon" style={{ background: bg, fontSize: 21 }}>{emoji}</div>
      </div>
    </div>
  );
}