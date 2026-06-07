"use client";

import { useState } from "react";
import { Send, Package, ChevronLeft, CheckCircle2, AlertCircle } from "lucide-react";
import { finalizeBatchCalibrationAction } from "@/app/actions/gage-actions";
import { useRouter } from "next/navigation";

interface BatchEditFormProps {
  batch: any;
}

export default function BatchEditForm({ batch }: BatchEditFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // 狀態與基本資訊
  const [invoiceNo, setInvoiceNo] = useState(batch.invoiceNo || "");
  const [totalCost, setTotalCost] = useState(batch.totalCost?.toString() || "");
  const [defaultCalDate, setDefaultCalDate] = useState(new Date().toISOString().split('T')[0]);
  
  // 個別儀器資訊 (預填現有紀錄或空白)
  const [itemDetails, setItemDetails] = useState<Record<string, any>>(
    batch.records.reduce((acc: any, rec: any) => {
      acc[rec.id] = {
        recordId: rec.id,
        gageId: rec.gageId,
        certificateNo: rec.certificateNo || "",
        result: rec.result === 'PENDING' ? 'PASS' : rec.result,
        calDate: rec.calDate ? new Date(rec.calDate).toISOString().split('T')[0] : defaultCalDate,
        calibrationCycle: rec.gage.calibrationCycle
      };
      return acc;
    }, {})
  );

  const handleDetailChange = (id: string, field: string, value: string) => {
    setItemDetails(prev => ({
      ...prev,
      [id]: { ...prev[id], [field]: value }
    }));
  };

  const handleSyncDates = () => {
    setItemDetails(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(id => {
        next[id] = { ...next[id], calDate: defaultCalDate };
      });
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        invoiceNo,
        totalCost: parseFloat(totalCost) || 0,
        items: Object.values(itemDetails)
      };

      await finalizeBatchCalibrationAction(batch.id, payload);
      router.push("/batches");
      router.refresh();
    } catch (error) {
      alert("更新失敗: " + (error instanceof Error ? error.message : "未知錯誤"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const isDraft = batch.status === 'DRAFT';

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 flex flex-col overflow-hidden">
      <header className="px-8 py-6 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.back()}
            className="p-2 hover:bg-slate-200 rounded-lg transition-colors text-slate-400"
            type="button"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isDraft ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}`}>
              <Package className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-bold text-slate-800 text-xl">
                {isDraft ? "填寫校正回校結果" : "批次校正詳情"}
              </h1>
              <p className="text-sm text-slate-500 font-medium">
                廠商: {batch.vendor.name} | 共 {batch.records.length} 台設備
              </p>
            </div>
          </div>
        </div>
        {isDraft && (
          <div className="flex items-center gap-2 px-4 py-1.5 bg-amber-50 text-amber-700 rounded-full text-xs font-bold border border-amber-100">
            <AlertCircle className="w-4 h-4" />
            待確認回校
          </div>
        )}
      </header>

      <form onSubmit={handleSubmit} className="p-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">報價單 / 請款單號</label>
            <input 
              type="text" 
              disabled={!isDraft}
              value={invoiceNo}
              onChange={(e) => setInvoiceNo(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-kst-blue outline-none disabled:bg-slate-50"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">總費用</label>
            <input 
              type="number" 
              disabled={!isDraft}
              value={totalCost}
              onChange={(e) => setTotalCost(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-kst-blue outline-none disabled:bg-slate-50"
            />
          </div>
          {isDraft && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex justify-between">
                回校日期 (批次套用)
                <button type="button" onClick={handleSyncDates} className="text-kst-blue hover:underline">套用全部</button>
              </label>
              <input 
                type="date" 
                value={defaultCalDate}
                onChange={(e) => setDefaultCalDate(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-kst-blue outline-none"
              />
            </div>
          )}
        </div>

        <div className="space-y-4">
          <label className="text-sm font-bold text-slate-700 px-1">設備清單</label>
          <div className="border border-slate-100 rounded-2xl overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 font-bold text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">設備</th>
                  <th className="px-6 py-4">實際校正日期</th>
                  <th className="px-6 py-4">報告編號</th>
                  <th className="px-6 py-4 text-center">判定</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {batch.records.map((record: any) => (
                  <tr key={record.id} className="hover:bg-slate-50/30 transition-colors">
                    <td className="px-6 py-5">
                      <div className="font-bold text-slate-800">{record.gage.id}</div>
                      <div className="text-xs text-slate-400">{record.gage.name}</div>
                    </td>
                    <td className="px-6 py-5">
                      <input 
                        type="date" 
                        disabled={!isDraft}
                        value={itemDetails[record.id]?.calDate || ""}
                        onChange={(e) => handleDetailChange(record.id, 'calDate', e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border-transparent rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-kst-blue/20 outline-none disabled:opacity-50"
                      />
                    </td>
                    <td className="px-6 py-5">
                      <input 
                        type="text" 
                        disabled={!isDraft}
                        placeholder="填寫報告編號"
                        value={itemDetails[record.id]?.certificateNo || ""}
                        onChange={(e) => handleDetailChange(record.id, 'certificateNo', e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border-transparent rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-kst-blue/20 outline-none disabled:opacity-50 font-mono"
                      />
                    </td>
                    <td className="px-6 py-5">
                      <select 
                        disabled={!isDraft}
                        value={itemDetails[record.id]?.result || "PASS"}
                        onChange={(e) => handleDetailChange(record.id, 'result', e.target.value)}
                        className={`w-full px-3 py-2 rounded-lg text-xs font-bold outline-none border-none transition-colors ${
                          itemDetails[record.id]?.result === 'FAIL' 
                            ? 'bg-red-50 text-red-600' 
                            : 'bg-emerald-50 text-emerald-600'
                        } disabled:opacity-50`}
                      >
                        <option value="PASS">PASS</option>
                        <option value="FAIL">FAIL</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {isDraft && (
          <footer className="pt-6 flex gap-4 border-t border-slate-50">
            <button 
              type="button"
              onClick={() => router.back()}
              className="flex-1 px-8 py-4 border border-slate-200 rounded-2xl text-sm font-bold text-slate-600 hover:bg-slate-50"
            >
              取消返回
            </button>
            <button 
              disabled={isSubmitting}
              type="submit"
              className="flex-2 px-8 py-4 bg-kst-blue text-white rounded-2xl text-sm font-bold hover:bg-blue-700 shadow-xl shadow-blue-500/20 flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-5 h-5" />
              {isSubmitting ? "更新中..." : "確認校正回校"}
            </button>
          </footer>
        )}
      </form>
    </div>
  );
}
