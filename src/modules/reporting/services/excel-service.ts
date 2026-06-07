import * as XLSX from 'xlsx';

export interface ReportData {
  certificateNo: string;
  calDate: Date;
  nextCalDate: Date;
  gage: {
    id: string;
    name: string;
    spec: string | null;
    precision: string | null;
    location: string;
  };
  environment?: {
    temperature: string;
    humidity: string;
  };
  masterGages: Array<{ id: string, name: string }>;
  details: Array<{
    category: string | null;
    point: string;
    standard: number | null;
    actual: number | null;
    error: number | null;
    result: string | null;
  }>;
  result: 'PASS' | 'FAIL';
  inspector: string;
  reviewer?: string;
}

/**
 * Service to generate and download Excel reports for internal calibration
 */
export const exportReportToExcel = (data: ReportData) => {
  // 1. Prepare Header Info (Metadata)
  const headerInfo = [
    ['KST CALIBRATION - INTERNAL REPORT', ''],
    ['Report No / 報告編號', data.certificateNo],
    ['Cal Date / 校正日期', data.calDate.toLocaleDateString()],
    ['Due Date / 有效期限', data.nextCalDate.toLocaleDateString()],
    ['', ''],
    ['INSTRUMENT INFO / 儀器資訊', ''],
    ['Asset ID / 管理編號', data.gage.id],
    ['Name / 設備名稱', data.gage.name],
    ['Model / 規格型號', data.gage.spec || '-'],
    ['Accuracy / 精度範圍', data.gage.precision || '-'],
    ['', ''],
    ['ENVIRONMENT / 環境條件', ''],
    ['Temp / 溫度', `${data.environment?.temperature || '23'} °C`],
    ['Humidity / 濕度', `${data.environment?.humidity || '50'} %`],
    ['', ''],
    ['MASTER GAGES / 標準器追溯', ''],
    ...data.masterGages.map(g => [`${g.id} - ${g.name}`, '']),
    ['', ''],
  ];

  // 2. Prepare Measurement Table
  const tableHeader = [
    'Category / 項目',
    'Nominal / 標稱值',
    'Standard / 標準值',
    'Actual / 實測值',
    'Error / 誤差',
    'Result / 判定'
  ];

  const tableData = data.details.map(d => [
    d.category || 'Basic',
    d.point,
    d.standard ?? '-',
    d.actual ?? '-',
    d.error !== null ? (d.error > 0 ? `+${d.error}` : d.error) : '-',
    d.result === 'PASS' ? 'OK (合格)' : 'NG (不合格)'
  ]);

  // 3. Prepare Footer
  const footerInfo = [
    ['', ''],
    ['FINAL RESULT / 最終判定', data.result === 'PASS' ? 'ACCEPTED (符合規範)' : 'REJECTED (不符合)'],
    ['Calibrated By / 校正人員', data.inspector],
    ['Approved By / 核准', data.reviewer || 'SYSTEM'],
  ];

  // Combine everything into a single worksheet
  const wsContent = [
    ...headerInfo,
    tableHeader,
    ...tableData,
    ...footerInfo
  ];

  const ws = XLSX.utils.aoa_to_sheet(wsContent);

  // Styling (Basic column widths)
  ws['!cols'] = [
    { wch: 30 }, // A
    { wch: 20 }, // B
    { wch: 15 }, // C
    { wch: 15 }, // D
    { wch: 15 }, // E
    { wch: 15 }, // F
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Internal Report');

  // Generate file name
  const fileName = `Report_${data.gage.id}_${data.certificateNo || Date.now()}.xlsx`;

  // Write and download
  XLSX.writeFile(wb, fileName);
};
