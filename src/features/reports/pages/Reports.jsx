import { useReports } from '../hooks/useReports';
import { ReportCard } from '../components/ReportCard';

export default function Reports() {
  const { reports, handleExport } = useReports();

  return (
    <div className="page">
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

      <div className="page-header">
        <div className="page-header-left">
          <h2>Reports</h2>
          <p>Export system data in CSV, Excel, or PDF format.</p>
        </div>
      </div>

      {/* Install notice */}
      <div style={{
        background: '#FFFBEB',
        border: '1.5px solid #FDE68A',
        borderRadius: 10,
        padding: '11px 16px',
        marginBottom: 22,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        fontSize: 13,
      }}>
        <span style={{ fontSize: 16 }}>ℹ️</span>
        <span style={{ color: '#854D0E' }}>
          Excel and PDF exports require npm packages. Run once if not installed:&nbsp;
          <code style={{ background: '#FEF9C3', padding: '2px 7px', borderRadius: 5, fontFamily: 'monospace', fontSize: 12.5 }}>
            npm install xlsx jspdf jspdf-autotable
          </code>
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 20 }}>
        {reports.map(report => (
          <ReportCard
            key={report.id}
            report={report}
            onExport={handleExport}
          />
        ))}
      </div>
    </div>
  );
}