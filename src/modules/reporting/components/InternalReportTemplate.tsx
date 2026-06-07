'use client';

import React from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Thermometer, 
  Droplets, 
  User, 
  Calendar, 
  ShieldCheck,
  FileText,
  Clock,
  Hash
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface MeasurementPoint {
  id: string;
  category: string | null;
  point: string;
  standard: number | null;
  actual: number | null;
  error: number | null;
  result: string | null;
}

interface ReportData {
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
  details: MeasurementPoint[];
  result: 'PASS' | 'FAIL';
  inspector: string;
  reviewer?: string;
  reportType?: 'INTERNAL' | 'EXTERNAL';
}

interface Props {
  data: ReportData;
}

export default function InternalReportTemplate({ data }: Props) {
  const { t, language } = useLanguage();
  const isZh = language === 'zh-TW';

  const Label = ({ zh, en }: { zh: string, en: string }) => (
    <div className="flex flex-col leading-tight">
      <span className="text-[11px] font-bold text-slate-800">{zh}</span>
      <span className="text-[9px] text-slate-400 font-medium uppercase tracking-tighter">{en}</span>
    </div>
  );

  return (
    <div className="w-full max-w-[210mm] mx-auto bg-white p-[15mm] text-slate-800 print:p-0 print:shadow-none shadow-2xl rounded-sm border border-slate-100 min-h-[297mm] flex flex-col font-sans">
      
      {/* --- HEADER --- */}
      <header className="flex justify-between items-start border-b-2 border-kst-blue pb-6 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-kst-blue rounded-xl flex items-center justify-center shadow-lg shadow-blue-100">
            <div className="w-6 h-6 border-4 border-white rounded-sm rotate-45" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-2xl font-black tracking-tighter text-kst-blue">KST CALIBRATION</h1>
          <div className="flex flex-col -mt-1">
            <span className="text-sm font-bold text-slate-600">
              {data.reportType === 'EXTERNAL' ? '外部校正報告' : '內部校正報告'}
            </span>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
              {data.reportType === 'EXTERNAL' ? 'External Calibration Report' : 'Internal Calibration Report'}
            </span>
          </div>
          </div>
        </div>

        <div className="flex flex-col items-end text-right">
          <div className="bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 flex items-center gap-3">
            <Hash className="w-4 h-4 text-slate-300" />
            <div className="flex flex-col items-end">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Report No.</span>
              <span className="text-sm font-mono font-bold text-kst-blue">{data.certificateNo || 'PENDING'}</span>
            </div>
          </div>
        </div>
      </header>

      {/* --- INSTRUMENT INFO --- */}
      <section className="grid grid-cols-3 gap-6 mb-8">
        <div className="col-span-2 grid grid-cols-2 gap-4 bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
          <div className="space-y-1">
            <Label zh="管理編號" en="Asset ID" />
            <div className="font-mono font-bold text-slate-700">{data.gage.id}</div>
          </div>
          <div className="space-y-1">
            <Label zh="設備名稱" en="Instrument Name" />
            <div className="font-bold text-slate-700">{data.gage.name}</div>
          </div>
          <div className="space-y-1">
            <Label zh="規格型號" en="Model / Spec" />
            <div className="text-sm text-slate-600">{data.gage.spec || '-'}</div>
          </div>
          <div className="space-y-1">
            <Label zh="精度範圍" en="Accuracy / Range" />
            <div className="text-sm text-slate-600">{data.gage.precision || '-'}</div>
          </div>
        </div>

        <div className="space-y-4 bg-blue-50/30 p-6 rounded-2xl border border-blue-100/50">
          <div className="flex items-center gap-3">
            <Calendar className="w-4 h-4 text-kst-blue" />
            <div className="space-y-1">
              <Label zh="校正日期" en="Cal Date" />
              <div className="text-sm font-bold">{new Date(data.calDate).toLocaleDateString(isZh ? 'zh-TW' : 'en-US')}</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Clock className="w-4 h-4 text-kst-blue" />
            <div className="space-y-1">
              <Label zh="有效期限" en="Due Date" />
              <div className="text-sm font-bold">{new Date(data.nextCalDate).toLocaleDateString(isZh ? 'zh-TW' : 'en-US')}</div>
            </div>
          </div>
        </div>
      </section>

      {/* --- ENVIRONMENT & TRACEABILITY --- */}
      <section className="grid grid-cols-2 gap-6 mb-8">
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-l-4 border-kst-blue pl-3">
            <Label zh="環境條件" en="Environmental Conditions" />
          </div>
          <div className="flex gap-8 px-4">
            <div className="flex items-center gap-2">
              <Thermometer className="w-4 h-4 text-orange-400" />
              <span className="text-sm font-bold text-slate-700">{data.environment?.temperature || '23±2'} °C</span>
            </div>
            <div className="flex items-center gap-2">
              <Droplets className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-bold text-slate-700">{data.environment?.humidity || '50±10'} %</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2 border-l-4 border-kst-blue pl-3">
            <Label zh="標準器追溯" en="Traceability / Master Gages" />
          </div>
          <div className="px-4 space-y-1">
            {data.masterGages.length > 0 ? data.masterGages.map(g => (
              <div key={g.id} className="text-xs font-medium text-slate-600 flex gap-2">
                <ShieldCheck className="w-3 h-3 text-emerald-500" />
                {g.id} - {g.name}
              </div>
            )) : (
              <div className="text-xs text-slate-400 italic">None specified</div>
            )}
          </div>
        </div>
      </section>

      {/* --- DATA TABLE --- */}
      <section className="flex-1 mb-8">
        <div className="flex items-center gap-2 border-l-4 border-kst-blue pl-3 mb-4">
          <Label zh="校正測量結果" en="Calibration Measurement Results" />
        </div>
        
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-slate-100 text-left border-y border-slate-200">
              <th className="px-4 py-2"><Label zh="項目" en="Item" /></th>
              <th className="px-4 py-2"><Label zh="標稱值" en="Nominal" /></th>
              <th className="px-4 py-2"><Label zh="標準值" en="Standard" /></th>
              <th className="px-4 py-2"><Label zh="實測值" en="Actual" /></th>
              <th className="px-4 py-2"><Label zh="誤差" en="Error" /></th>
              <th className="px-4 py-2 text-center"><Label zh="判定" en="Result" /></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.details.map((row, idx) => (
              <tr key={row.id || idx} className={`transition-colors ${row.result === 'FAIL' ? 'bg-red-50/50 hover:bg-red-100/50' : 'hover:bg-slate-50'}`}>
                <td className="px-4 py-3 text-xs font-bold text-slate-600">{row.category || 'Basic'}</td>
                <td className="px-4 py-3 text-sm font-mono">{row.point}</td>
                <td className="px-4 py-3 text-sm font-mono text-slate-500">{row.standard ?? '-'}</td>
                <td className="px-4 py-3 text-sm font-mono font-bold text-slate-800">{row.actual ?? '-'}</td>
                <td className="px-4 py-3 text-sm font-mono text-kst-blue">{row.error !== null ? (row.error > 0 ? `+${row.error}` : row.error) : '-'}</td>
                <td className="px-4 py-3 text-center">
                  {row.result === 'PASS' ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase">
                      <CheckCircle2 className="w-3 h-3" /> OK
                    </span>
                  ) : row.result === 'FAIL' ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-black text-red-600 bg-red-50 px-2 py-0.5 rounded-full uppercase">
                      <XCircle className="w-3 h-3" /> NG
                    </span>
                  ) : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* --- FOOTER / SIGNATURE --- */}
      <footer className="mt-auto pt-8 border-t border-slate-200">
        <div className="grid grid-cols-3 gap-8">
          <div className="flex flex-col items-center">
            <div className="w-full h-16 border-b border-dashed border-slate-300 flex items-end justify-center pb-2">
              <span className="text-sm font-cursive text-slate-400 italic">Electronic Signature</span>
            </div>
            <div className="mt-2 text-center">
              <Label zh="核准" en="Approved By" />
              <div className="text-xs font-bold text-slate-700 mt-1">{data.reviewer || 'SYSTEM'}</div>
            </div>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="w-full h-16 border-b border-dashed border-slate-300 flex items-end justify-center pb-2">
              <span className="text-sm font-bold text-slate-800 font-mono">{data.inspector}</span>
            </div>
            <div className="mt-2 text-center">
              <Label zh="校正人員" en="Calibrated By" />
              <div className="text-xs font-bold text-slate-700 mt-1">{data.inspector}</div>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center bg-slate-50 rounded-2xl border border-slate-100 p-4">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Final Result</div>
            <div className={`text-2xl font-black ${data.result === 'PASS' ? 'text-emerald-500' : 'text-red-500'}`}>
              {data.result === 'PASS' ? 'ACCEPTED' : 'REJECTED'}
            </div>
            <div className="text-[9px] font-bold text-slate-400 mt-1">{data.result === 'PASS' ? '符合規範要求' : '不符合規範要求'}</div>
          </div>
        </div>

        <div className="mt-8 flex justify-between items-end text-[9px] text-slate-400 font-medium">
          <div>
            KST-QC-FORM-001 (Rev. 2.0)
          </div>
          <div className="flex gap-4">
            <span>© 2026 KST Calibration System</span>
            <span>Printed: {new Date().toLocaleString()}</span>
          </div>
        </div>
      </footer>

      {/* Print Specific Styles */}
      <style jsx global>{`
        @media print {
          body { background: white !important; }
          .no-print { display: none !important; }
          @page { margin: 10mm; }
        }
      `}</style>
    </div>
  );
}
