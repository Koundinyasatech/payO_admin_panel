import { useState } from 'react';
import { exportUsers } from '../../../api/adminApi';

export function ExportButton() {
  const [showExport, setShowExport] = useState(false);

  const handleExport = async (type) => {
    const ok = window.confirm(`Do you want to download ${type.toUpperCase()} file?`);
    if (!ok) return;
    try {
      const res = await exportUsers(type);
      const blob = new Blob([res.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `users.${type}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed');
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      <button onClick={() => setShowExport(!showExport)} style={{ height: 58, padding: '0 18px', borderRadius: 15, border: '1.5px solid #CBD5E1', background: '#07c6fa', cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>
        Export ▼
      </button>
      {showExport && (
        <div style={{ position: 'absolute', top: 65, right: 0, width: 160, background: '#fff', border: '1px solid #E2E8F0', borderRadius: 10, boxShadow: '0 8px 20px rgba(0,0,0,0.08)', overflow: 'hidden', zIndex: 999 }}>
          <div onClick={() => { handleExport('csv'); setShowExport(false); }} style={{ padding: '12px 16px', cursor: 'pointer', borderBottom: '1px solid #E2E8F0' }}>CSV File</div>
          <div onClick={() => { handleExport('xlsx'); setShowExport(false); }} style={{ padding: '12px 16px', cursor: 'pointer' }}>Excel File</div>
        </div>
      )}
    </div>
  );
}