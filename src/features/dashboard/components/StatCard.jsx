import { Skeleton } from './Skeleton';
import { Sparkline } from './Sparkline';

export function StatCard({ label, value, change, up, color, iconBg, icon, sparkData, loading }) {
  return (
    <div style={{
      background: 'var(--stat-card-bg, #ffffff)',
      border: '1px solid var(--stat-card-border, #E2E8F0)',
      borderRadius: 16, padding: '22px 22px 18px',
      display: 'flex', flexDirection: 'column', gap: 0,
      minHeight: 170, position: 'relative', overflow: 'hidden',
      transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'default',
    }}
    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.3)'; }}
    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--stat-card-label, #94A3B8)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>{label}</div>
        <div style={{ width: 38, height: 38, borderRadius: 10, background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{icon}</div>
      </div>
      {loading
        ? <><Skeleton h={34} radius={8} style={{ marginBottom: 12 }} /><Skeleton w="60%" h={14} radius={6} style={{ marginBottom: 10 }} /><Skeleton h={14} w="40%" radius={6} /></>
        : <>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 34, fontWeight: 700, color: 'var(--stat-card-value, #0D1B3E)', letterSpacing: '-1px', lineHeight: 1, marginBottom: 12 }}>{value}</div>
            <div style={{ marginBottom: 10 }}><Sparkline points={sparkData} color={color} /></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 600, color: up ? '#10B981' : '#EF4444' }}>
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                {up ? <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /> : <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />}
              </svg>
              {change}
            </div>
          </>
      }
    </div>
  );
}