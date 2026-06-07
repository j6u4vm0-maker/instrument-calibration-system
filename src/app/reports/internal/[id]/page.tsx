import React from 'react';
import { GageService } from "@/services/gage-service";
import { notFound } from "next/navigation";
import { CheckCircle2, XCircle } from "lucide-react";
import PrintButton from "@/components/PrintButton";

export default async function InternalReportPrintPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const record = await GageService.getRecordById(id);

  if (!record || record.reportType !== 'INTERNAL') {
    notFound();
  }

  const { gage, details } = record;

  let displayNotes = record.notes || "";
  let envDisplay = "-";
  let mastersDisplay = "-";

  const envMatch = displayNotes.match(/\[Env:\s*T=([^C]+)C,\s*H=([^%]+)%\]/);
  if (envMatch) {
    envDisplay = `${envMatch[1]}°C / ${envMatch[2]}% RH`;
    displayNotes = displayNotes.replace(/\[Env:.*?\]\s*/, '');
  }

  const mastersMatch = displayNotes.match(/\[Masters:\s*(.*?)\]/);
  if (mastersMatch) {
    mastersDisplay = mastersMatch[1].trim() || "-";
    displayNotes = displayNotes.replace(/\[Masters:.*?\]\s*/, '');
  }
  displayNotes = displayNotes.trim();

  return (
    <div className="bg-white min-h-screen p-12 text-slate-900 font-sans print:p-0">
      {/* 報告表頭 */}
      <div className="border-b-2 border-slate-900 pb-6 mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter">內部校驗報告</h1>
          <p className="text-sm font-bold text-slate-500 mt-1">INTERNAL CALIBRATION REPORT</p>
        </div>
        <div className="text-right">
          <div className="text-sm font-bold">報告編號: <span className="font-mono">{record.certificateNo || record.id.slice(-8).toUpperCase()}</span></div>
          <div className="text-sm font-bold">校正日期: <span className="font-mono">{new Date(record.calDate).toLocaleDateString()}</span></div>
        </div>
      </div>

      {/* 設備基本資訊 */}
      <section className="mb-8">
        <h2 className="text-xs font-black bg-slate-900 text-white px-3 py-1 inline-block mb-4 uppercase tracking-widest">設備資訊 / Equipment Info</h2>
        <div className="grid grid-cols-2 gap-y-4 border border-slate-200 p-6 rounded-lg">
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase">管理編號 / Asset ID</label>
            <p className="font-bold">{gage.id}</p>
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase">設備名稱 / Name</label>
            <p className="font-bold">{gage.name}</p>
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase">規格/廠牌 / Specification</label>
            <p className="font-bold">{gage.spec || '-'}</p>
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase">精度 / Precision</label>
            <p className="font-bold">{gage.precision || '-'}</p>
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase">標準件 / Master Gages</label>
            <p className="font-bold">{mastersDisplay}</p>
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase">溫度/濕度 / Temp & Humidity</label>
            <p className="font-bold">{envDisplay}</p>
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase">校正週期 / Cycle</label>
            <p className="font-bold">{gage.calibrationCycle} Months</p>
          </div>
        </div>
      </section>

      {/* 校正數據 */}
      <section className="mb-8">
        <h2 className="text-xs font-black bg-slate-900 text-white px-3 py-1 inline-block mb-4 uppercase tracking-widest">校正數據 / Calibration Data</h2>
        <table className="w-full border-collapse border border-slate-300 text-sm">
          <thead>
            <tr className="bg-slate-50">
              <th className="border border-slate-300 px-4 py-2 text-left">項目 / Category</th>
              <th className="border border-slate-300 px-4 py-2 text-right">標稱值 / Spec Value</th>
              <th className="border border-slate-300 px-4 py-2 text-right">下限 / Lower Limit</th>
              <th className="border border-slate-300 px-4 py-2 text-right">上限 / Upper Limit</th>
              <th className="border border-slate-300 px-4 py-2 text-right">實測值 / Actual</th>
              <th className="border border-slate-300 px-4 py-2 text-right">誤差 / Error</th>
              <th className="border border-slate-300 px-4 py-2 text-center">判定 / Result</th>
            </tr>
          </thead>
          <tbody>
            {details.map((d: any, idx: number) => (
              <tr key={idx}>
                <td className="border border-slate-300 px-4 py-2 font-medium">{d.category || '-'}</td>
                <td className="border border-slate-300 px-4 py-2 text-right font-mono font-bold">{d.point}</td>
                <td className="border border-slate-300 px-4 py-2 text-right font-mono text-red-600">{d.lowerLimit ?? '-'}</td>
                <td className="border border-slate-300 px-4 py-2 text-right font-mono text-red-600">{d.upperLimit ?? '-'}</td>
                <td className="border border-slate-300 px-4 py-2 text-right font-mono">{d.actual ?? '-'}</td>
                <td className="border border-slate-300 px-4 py-2 text-right font-mono">{d.error ?? '0'}</td>
                <td className="border border-slate-300 px-4 py-2 text-center">
                  {d.result === 'PASS' ? (
                    <span className="text-emerald-600 font-bold">PASS</span>
                  ) : (
                    <span className="text-red-600 font-bold">FAIL</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* 結論 */}
      <div className="grid grid-cols-2 gap-8 mb-12">
        <div className="border border-slate-200 p-6 rounded-lg">
          <label className="text-[10px] font-bold text-slate-400 uppercase">備註 / Remarks</label>
          <p className="text-sm mt-2 min-h-[60px] whitespace-pre-wrap">{displayNotes || '無 (None)'}</p>
        </div>
        <div className="flex flex-col justify-center items-center border-2 border-slate-900 rounded-lg bg-slate-50">
          <label className="text-[10px] font-bold text-slate-400 uppercase mb-2">最終判定 / Final Decision</label>
          {record.result === 'PASS' ? (
            <div className="flex items-center gap-2 text-3xl font-black text-emerald-600">
              <CheckCircle2 className="w-8 h-8" /> 合格 / PASS
            </div>
          ) : (
            <div className="flex items-center gap-2 text-3xl font-black text-red-600">
              <XCircle className="w-8 h-8" /> 不合格 / FAIL
            </div>
          )}
        </div>
      </div>

      {/* 簽核欄位 */}
      <div className="grid grid-cols-3 gap-8 border-t border-slate-200 pt-8 text-center">
        <div>
          <div className="h-16 flex items-end justify-center border-b border-slate-300 pb-2 mb-2 italic text-slate-400">
            {/* Placeholder for Reviewer */}
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase">審核人 / Reviewer</p>
        </div>
        <div>
          <div className="h-16 flex items-end justify-center border-b border-slate-300 pb-2 mb-2 italic text-slate-400">
            {record.inspector}
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase">校驗員 / Inspector</p>
        </div>
        <div>
          <div className="h-16 flex items-end justify-center border-b border-slate-300 pb-2 mb-2 font-mono text-slate-300">
            {new Date().toLocaleDateString()}
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase">核發日期 / Date Issued</p>
        </div>
      </div>

      {/* 列印按鈕 (僅在畫面上顯示) */}
      <div className="fixed bottom-8 right-8 print:hidden">
        <PrintButton />
      </div>
    </div>
  );
}
