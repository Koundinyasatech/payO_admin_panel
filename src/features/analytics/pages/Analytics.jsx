import { useAnalytics } from '../hooks/useAnalytics';
import { KPICard } from '../components/KPICard';
import { BarChart } from '../components/BarChart';
import { StatusDistribution } from '../components/StatusDistribution';

export default function Analytics() {
  const { loading, kpis, monthlyData, distribution, summary } = useAnalytics();

  return (
    <div className="page">
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>

      <div className="page-header">
        <div className="page-header-left">
          <h2>Analytics</h2>
          <p>KYC performance metrics and trends.</p>
        </div>
      </div>

      <div className="stats-row" style={{ marginBottom: 22 }}>
        {kpis.map(k => (
          <KPICard key={k.label} {...k} loading={loading} />
        ))}
      </div>

      <div className="analytics-grid">
        {/* Bar chart */}
        <div className="chart-card">
          <h3>Monthly KYC Submissions</h3>
          <BarChart data={monthlyData} loading={loading} />
        </div>

        {/* Status distribution */}
        <div className="chart-card">
          <h3>Status Distribution</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 16 }}>
            <StatusDistribution data={distribution} loading={loading} />
          </div>

          {/* Summary box */}
          <div style={{
            marginTop: 28,
            padding: '16px',
            background: 'var(--gray-50,#F8FAFC)',
            borderRadius: 12,
            border: '1px solid var(--gray-200)',
          }}>
            <div style={{
              fontSize: 11,
              fontWeight: 700,
              color: 'var(--gray-400)',
              textTransform: 'uppercase',
              letterSpacing: '0.7px',
              marginBottom: 12,
            }}>
              Summary
            </div>
            {summary.map(([label, value]) => (
              <div
                key={label}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: 13,
                  padding: '6px 0',
                  borderBottom: '1px solid var(--gray-100)',
                }}
              >
                <span style={{ color: 'var(--gray-600)' }}>{label}</span>
                <span style={{ fontWeight: 700, color: 'var(--navy)' }}>
                  {loading ? '—' : value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}