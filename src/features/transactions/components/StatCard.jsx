// Local Skeleton placeholder
function Skeleton({ w, h, r }) {
  return (
    <div style={{
      width: w, height: h, borderRadius: r,
      background: 'linear-gradient(90deg,var(--skeleton-a,#E2E8F0) 25%,var(--skeleton-b,#F1F5F9) 50%,var(--skeleton-a,#E2E8F0) 75%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.4s infinite',
    }} />
  );
}

export function StatCard({ label, value, icon, iconBg, color, sub, loading }) {
  return (
    <div className="stat-card" style={{ borderRadius: 16, padding: '20px 22px' }}>
      <div className="stat-top">
        <div>
          <div className="stat-label">{label}</div>
          <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 28, fontWeight: 800, color: 'var(--stat-card-value,#0D1B3E)', letterSpacing: '-1px', lineHeight: 1, marginTop: 6 }}>
            {loading ? <Skeleton w={80} h={28} r={6} /> : value}
          </div>
          {sub && !loading && (
            <div style={{ fontSize: 11.5, color, fontWeight: 600, marginTop: 5 }}>{sub}</div>
          )}
        </div>
        <div style={{ width: 44, height: 44, borderRadius: 13, background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
          {icon}
        </div>
      </div>
    </div>
  );
}