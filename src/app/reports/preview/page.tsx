'use client';

import React from 'react';
import InternalReportTemplate from '@/modules/reporting/components/InternalReportTemplate';
import { Printer, ArrowLeft, Download, FileSpreadsheet } from 'lucide-react';
import Link from 'next/link';
import { exportReportToExcel } from '@/modules/reporting/services/excel-service';

export default function ReportPreviewPage() {
  // Mock Data for Demo
  const mockReport = {
    certificateNo: "KST-2026-0514-001",
    calDate: new Date(),
    nextCalDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
    gage: {
      id: "KST-VC-001",
      name: "游標卡尺",
      spec: "0-150mm / 0.01mm",
      precision: "±0.02mm",
      location: "Chennai Factory"
    },
    environment: {
      temperature: "22.5",
      humidity: "52"
    },
    masterGages: [
      { id: "STD-BLK-01", name: "塊規組 (Grade 0)" },
      { id: "STD-MIC-05", name: "標準外徑千分尺" }
    ],
    details: [
      { id: "1", category: "外徑 (OD)", point: "0 mm", standard: 0.00, actual: 0.00, error: 0.00, result: "PASS" },
      { id: "2", category: "外徑 (OD)", point: "50 mm", standard: 50.00, actual: 50.01, error: 0.01, result: "PASS" },
      { id: "3", category: "外徑 (OD)", point: "100 mm", standard: 100.00, actual: 100.02, error: 0.02, result: "PASS" },
      { id: "4", category: "內徑 (ID)", point: "10 mm", standard: 10.00, actual: 9.99, error: -0.01, result: "PASS" },
      { id: "5", category: "深徑 (Depth)", point: "20 mm", standard: 20.00, actual: 20.00, error: 0.00, result: "PASS" },
    ],
    result: "PASS" as const,
    inspector: "Chen Xiao Ming",
    reviewer: "Lee Da Long"
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExcelExport = () => {
    exportReportToExcel(mockReport);
  };

  return (
    <div className="min-h-screen bg-slate-100/50 pb-20">
      {/* Control Bar - Hidden during print */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 py-4 flex justify-between items-center no-print">
        <div className="flex items-center gap-4">
          <Link href="/reports" className="p-2 hover:bg-slate-100 rounded-full transition-all">
            <ArrowLeft className="w-5 h-5 text-slate-500" />
          </Link>
          <h1 className="text-lg font-black text-slate-800">報告預覽 / Report Preview</h1>
        </div>
        
        <div className="flex gap-3">
          <button 
            onClick={handleExcelExport}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-xl text-sm font-bold text-emerald-700 hover:bg-emerald-100 transition-all shadow-sm"
          >
            <FileSpreadsheet className="w-4 h-4" /> 匯出 Excel
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
            <Download className="w-4 h-4" /> 下載 PDF
          </button>
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 px-6 py-2 bg-kst-blue text-white rounded-xl text-sm font-black hover:bg-blue-700 transition-all shadow-xl shadow-blue-100"
          >
            <Printer className="w-4 h-4" /> 列印報告
          </button>
        </div>
      </div>

      {/* Report Container */}
      <div className="mt-8 px-4">
        <InternalReportTemplate data={mockReport} />
      </div>

      {/* Helper Text */}
      <div className="text-center mt-8 text-slate-400 text-xs no-print">
        按 Ctrl+P 可直接將報告另存為 PDF。
      </div>
    </div>
  );
}
