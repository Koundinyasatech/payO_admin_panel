import { useState } from 'react';
import { ExportFormatButton } from './ExportFormatButton';
import { FORMATS } from '../utils/exportHelpers';

export function ReportCard({ report, onExport }) {
  const [busy, setBusy] = useState({});
  const [done, setDone] = useState({});
  const [count, setCount] = useState(null);

  const handleExport = async (formatId) => {
    const key = `${report.id}-${formatId}`;
    if (busy[key]) return;
    setBusy(prev => ({ ...prev, [key]: true }));
    try {
      const result = await onExport(report.id, formatId);
      if (result?.count != null) setCount(result.count);
      setDone(prev => ({ ...prev, [key]: true }));
      setTimeout(() => {
        setDone(prev => {
          const n = { ...prev };
          delete n[key];
          return n;
        });
      }, 2500);
    } catch (err) {
      console.error('Export error:', err);
      alert(`Export failed: ${err?.message || 'Unknown error'}`);
    } finally {
      setBusy(prev => ({ ...prev, [key]: false }));
    }
  };

  return (
    <div style={{ background: 'var(--white)', borderRadius: 16, border: '1.5px solid var(--gray-200)', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
      <div style={{ padding: '22px 22px 18px', borderBottom: '1px solid var(--gray-100)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 12 }}>
          <div style={{ width: 48, height: 48, borderRadius: 13, background: report.bg, border: `1.5px solid ${report.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>
            {report.icon}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: 16, color: 'var(--navy)', marginBottom: 3 }}>{report.title}</div>
            {count != null && (
              <div style={{ fontSize: 11.5, fontWeight: 600, color: report.color, background: report.bg, border: `1px solid ${report.border}`, display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 20 }}>
                ✓ {count.toLocaleString()} records exported
              </div>
            )}
          </div>
        </div>

        <div style={{ fontSize: 13, color: 'var(--gray-500)', lineHeight: 1.6, marginBottom: 14 }}>
          {report.description}
        </div>

        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: 7 }}>Contains</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {report.contains.map(item => (
              <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: report.color, flexShrink: 0 }} />
                <span style={{ color: 'var(--gray-600)', fontWeight: 500 }}>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ padding: '16px 22px 20px' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: 10 }}>
          Export As
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {FORMATS.map(f => {
            const key = `${report.id}-${f.id}`;
            return (
              <ExportFormatButton
                key={f.id}
                format={f}
                isLoading={!!busy[key]}
                isDone={!!done[key]}
                onClick={() => handleExport(f.id)}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}