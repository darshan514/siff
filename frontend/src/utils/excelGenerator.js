export const generateBatchReportExcel = (items) => {
  if (!items || items.length === 0) {
    alert('No data available to export.');
    return;
  }

  // Define headers
  const headers = ['Report ID', 'Date', 'Report Text', 'Hazard Category', 'Severity', 'Risk Level', 'SIF Precursor', 'Status'];

  // Convert items to CSV rows
  const csvRows = [headers.join(',')];

  items.forEach((item) => {
    // Escape quotes in text fields
    const escapeCsv = (text) => `"${(text || '').toString().replace(/"/g, '""')}"`;
    
    const row = [
      escapeCsv(item.id),
      escapeCsv(new Date(item.timestamp).toLocaleString()),
      escapeCsv(item.report || item.text),
      escapeCsv(item.hazard_category || item.category),
      escapeCsv(item.severity_score),
      escapeCsv(item.risk_level),
      escapeCsv(item.is_sif_precursor ? 'Yes' : 'No'),
      escapeCsv(item.status || 'Pending')
    ];
    csvRows.push(row.join(','));
  });

  // Create a Blob from the CSV string
  const csvString = csvRows.join('\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  
  // Create a download link and trigger click
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `SIF_AI_Batch_Export_${Date.now()}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};