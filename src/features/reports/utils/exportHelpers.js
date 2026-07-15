function csvEscape(v) {
  const s = String(v ?? '');
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function doCSV(filename, headers, rows) {
  const csv = [headers, ...rows].map(r => r.map(csvEscape).join(',')).join('\r\n');
  triggerDownload(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' }), filename);
}

export async function doExcel(filename, sheetName, headers, rows) {
  let XLSX;
  try {
    XLSX = await import('xlsx');
  } catch {
    alert('Excel export requires the xlsx package.\n\nRun: npm install xlsx');
    return;
  }
  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  ws['!cols'] = headers.map((h, i) => {
    const max = Math.max(h.length, ...rows.map(r => String(r[i] ?? '').length));
    return { wch: Math.min(max + 2, 40) };
  });
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, filename);
}

export async function doPDF(filename, title, headers, rows) {
  let jsPDF, autoTable;
  try {
    ({ jsPDF } = await import('jspdf'));
    ({ default: autoTable } = await import('jspdf-autotable'));
  } catch {
    alert('PDF export requires jspdf and jspdf-autotable.\n\nRun: npm install jspdf jspdf-autotable');
    return;
  }
  const landscape = headers.length > 6;
  const doc = new jsPDF({ orientation: landscape ? 'landscape' : 'portrait', unit: 'mm' });

  // Header block
  doc.setFillColor(13, 27, 62);
  doc.rect(0, 0, doc.internal.pageSize.getWidth(), 28, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont(undefined, 'bold');
  doc.text(title, 14, 13);
  doc.setFontSize(9);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(180, 200, 230);
  doc.text(`Generated: ${new Date().toLocaleString('en-IN')}  ·  Total records: ${rows.length}`, 14, 22);

  autoTable(doc, {
    head: [headers],
    body: rows,
    startY: 34,
    styles: { fontSize: 8, cellPadding: 3, overflow: 'linebreak' },
    headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: 'bold', halign: 'center' },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    tableLineColor: [226, 232, 240],
    tableLineWidth: 0.3,
    margin: { left: 10, right: 10 },
  });

  // Footer on each page
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(`Page ${i} of ${totalPages}`, doc.internal.pageSize.getWidth() - 25, doc.internal.pageSize.getHeight() - 8);
    doc.text('PayO Admin Portal', 14, doc.internal.pageSize.getHeight() - 8);
  }

  doc.save(filename);
}

export const FORMATS = [
  { id: 'csv',   label: 'CSV',   icon: '📄', color: '#059669', bg: '#F0FDF4', border: '#A7F3D0', hoverBg: '#059669' },
  { id: 'excel', label: 'Excel', icon: '📊', color: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE', hoverBg: '#2563EB' },
  { id: 'pdf',   label: 'PDF',   icon: '📑', color: '#DC2626', bg: '#FEF2F2', border: '#FECACA', hoverBg: '#DC2626' },
];