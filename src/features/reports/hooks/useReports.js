import { useState } from 'react';
import { REPORTS } from '../utils/reportDefinitions';
import { doCSV, doExcel, doPDF } from '../utils/exportHelpers';

export function useReports() {
  const [exporting, setExporting] = useState({}); // track per report+format

  const handleExport = async (reportId, formatId) => {
    const key = `${reportId}-${formatId}`;
    if (exporting[key]) return;
    setExporting(prev => ({ ...prev, [key]: true }));

    try {
      const report = REPORTS.find(r => r.id === reportId);
      if (!report) throw new Error('Report not found');

      const data = await report.fetchData();
      const rows = report.toRows(data);
      const date = new Date().toISOString().split('T')[0];
      const fname = `PayO_${report.title.replace(/\s+/g, '_')}_${date}`;

      if (formatId === 'csv') doCSV(`${fname}.csv`, report.headers, rows);
      else if (formatId === 'excel') await doExcel(`${fname}.xlsx`, report.sheetName, report.headers, rows);
      else if (formatId === 'pdf') await doPDF(`${fname}.pdf`, report.title, report.headers, rows);

      return { count: data.length };
    } finally {
      setExporting(prev => {
        const n = { ...prev };
        delete n[key];
        return n;
      });
    }
  };

  return {
    reports: REPORTS,
    exporting,
    handleExport,
  };
}