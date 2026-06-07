"use client";

import { useState, useEffect } from "react";
import { X, ClipboardList, Send, Package, CheckCircle2, XCircle, ChevronLeft } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { batchCalibrationAction } from "@/app/actions/gage-actions";
import { useRouter } from "next/navigation";

interface BatchCalibrationFormProps {
  selectedGages: any[];
  vendors: any[];
}

export default function BatchCalibrationForm({ 
  selectedGages, 
  vendors
}: BatchCalibrationFormProps) {
  const { t } = useLanguage();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // 公共資訊
  const [vendorId, setVendorId] = useState("");
  const [totalCost, setTotalCost] = useState("");
  const [invoiceNo, setInvoiceNo] = useState("");
  const [defaultCalDate, setDefaultCalDate] = useState(new Date().toISOString().split('T')[0]);
  const [submissionType, setSubmissionType] = useState<'SENT_OUT' | 'COMPLETED'>('COMPLETED');
  
  // 個別儀器資訊 (報告編號, 結果, 日期)
  const [gageDetails, setGageDetails] = useState<Record<string, { certificateNo: string, result: string, calDate: string }>>({});

  useEffect(() => {
    setGageDetails(prev => {
      const updated = { ...prev };
      selectedGages.forEach(g => {
        if (!updated[g.id]) {
          updated[g.id] = { certificateNo: "", result: "PASS", calDate: defaultCalDate };
        } else {
          updated[g.id] = { ...updated[g.id], calDate: updated[g.id].calDate || defaultCalDate };
        }
      });
      return updated;
    });
  }, [selectedGages]);

  // 當預設日期改變時，更新所有尚未手動修改日期的項目的日期 (可選)
  // 或者簡單點：只在初始加載時設置。
  // 這裡我們改為：如果使用者改變了預設日期，則批次更新所有項目的日期，但保留其他資訊。
  useEffect(() => {
    setGageDetails(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(id => {
        next[id] = { ...next[id], calDate: defaultCalDate };
      });
      return next;
    });
  }, [defaultCalDate]);

  const handleDetailChange = (id: string, field: string, value: string) => {
    setGageDetails(prev => ({
      ...prev,
      [id]: { ...prev[id], [field]: value }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorId) {
      alert(t('calibration.cal.select_vendor_alert'));
      return;
    }
    
    setIsSubmitting(true);
    try {
      const payload = {
        vendorId,
        totalCost: parseFloat(totalCost) || 0,
        invoiceNo,
        status: submissionType === 'SENT_OUT' ? 'DRAFT' : 'COMPLETED',
        items: selectedGages.map(g => ({
          gageId: g.id,
          certificateNo: gageDetails[g.id]?.certificateNo || "",
          result: gageDetails[g.id]?.result || "PASS",
          calibrationCycle: g.calibrationCycle,
          calDate: gageDetails[g.id]?.calDate || defaultCalDate
        }))
      };

      await batchCalibrationAction(payload);
      router.push(submissionType === 'SENT_OUT' ? "/batches" : "/gages");
    } catch (error) {
      alert((t('calibration.cal.import_failed') || "Batch failed") + ": " + (error instanceof Error ? error.message : "unknown"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const avgCost = totalCost ? (parseFloat(totalCost) / selectedGages.length).toFixed(0) : "0";

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
            <div className="p-2 bg-kst-blue/10 rounded-lg text-kst-blue">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-bold text-slate-800 text-xl">{t('calibration.batch.batch_cal_mgmt')}</h1>
              <p className="text-sm text-slate-500 font-medium">{t('calibration.batch.total_selected', { count: selectedGages.length })}</p>
            </div>
          </div>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="p-8 space-y-8">
        {/* 提交模式選擇 */}
        <div className="flex bg-slate-100 p-1.5 rounded-2xl w-fit">
          <button
            type="button"
            onClick={() => setSubmissionType('COMPLETED')}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
              submissionType === 'COMPLETED' 
                ? 'bg-white text-kst-blue shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {t('calibration.batch.complete_cal_now')}
          </button>
          <button
            type="button"
            onClick={() => setSubmissionType('SENT_OUT')}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
              submissionType === 'SENT_OUT' 
                ? 'bg-white text-kst-blue shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {t('calibration.batch.create_slip_only')}
          </button>
        </div>

        {/* 公共資訊 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 bg-blue-50/30 p-6 rounded-2xl border border-blue-100/50">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('calibration.batch.vendor')}</label>
            <select 
              required
              value={vendorId}
              onChange={(e) => setVendorId(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-kst-blue outline-none"
            >
              <option value="">-- {t('calibration.cal.select_vendor_alert')} --</option>
              {vendors.map(v => (
                <option key={v.id} value={v.id}>{v.name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('calibration.batch.cost')}</label>
            <div className="relative">
              <input 
                type="number" 
                value={totalCost}
                onChange={(e) => setTotalCost(e.target.value)}
                placeholder="0"
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-kst-blue outline-none"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">
                {t('calibration.batch.avg_cost_per', { cost: avgCost })}
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('calibration.batch.invoice')}</label>
            <input 
              type="text" 
              value={invoiceNo}
              onChange={(e) => setInvoiceNo(e.target.value)}
              placeholder="Q-2024-05-001"
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-kst-blue outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('calibration.cal.default_date')}</label>
            <input 
              type="date" 
              value={defaultCalDate}
              onChange={(e) => setDefaultCalDate(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-kst-blue outline-none"
            />
          </div>
        </div>

        {/* 明細清單 */}
        <div className="space-y-4">
          <label className="text-sm font-bold text-slate-700 px-1">{t('calibration.batch.individual_report_info')}</label>
          <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 font-bold text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">{t('calibration.gage.id')} / {t('calibration.gage.name')}</th>
                  <th className="px-6 py-4">{t('calibration.gage.next_cal')}</th>
                  <th className="px-6 py-4">{t('calibration.cal.cert_no')}</th>
                  <th className="px-6 py-4 w-40 text-center">{t('calibration.cal.result')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {selectedGages.map((gage) => (
                  <tr key={gage.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-5">
                      <div className="font-bold text-slate-800">{gage.id}</div>
                      <div className="text-xs text-slate-400">{gage.name}</div>
                    </td>
                    <td className="px-6 py-5">
                      <input 
                        required
                        type="date" 
                        value={gageDetails[gage.id]?.calDate || defaultCalDate}
                        onChange={(e) => handleDetailChange(gage.id, 'calDate', e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50 border-transparent rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-kst-blue/20 outline-none transition-all"
                      />
                    </td>
                    <td className="px-6 py-5">
                      <input 
                        required={submissionType === 'COMPLETED'}
                        type="text" 
                        disabled={submissionType === 'SENT_OUT'}
                        placeholder={submissionType === 'SENT_OUT' ? t('calibration.batch.later') : "CAL-2024-001"}
                        value={gageDetails[gage.id]?.certificateNo || ""}
                        onChange={(e) => handleDetailChange(gage.id, 'certificateNo', e.target.value)}
                        className={`w-full px-4 py-2.5 border-transparent rounded-xl text-sm focus:ring-2 focus:ring-kst-blue/20 outline-none transition-all font-mono ${
                          submissionType === 'SENT_OUT' ? 'bg-slate-100 text-slate-400' : 'bg-slate-50 focus:bg-white'
                        }`}
                      />
                    </td>
                    <td className="px-6 py-5">
                      <select 
                        disabled={submissionType === 'SENT_OUT'}
                        value={gageDetails[gage.id]?.result || "PASS"}
                        onChange={(e) => handleDetailChange(gage.id, 'result', e.target.value)}
                        className={`w-full px-4 py-2.5 rounded-xl text-xs font-bold outline-none border-none cursor-pointer transition-colors ${
                          submissionType === 'SENT_OUT'
                            ? 'bg-slate-100 text-slate-400'
                            : gageDetails[gage.id]?.result === 'FAIL' 
                              ? 'bg-red-50 text-red-600' 
                              : 'bg-emerald-50 text-emerald-600'
                        }`}
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

        <footer className="pt-6 flex gap-4 border-t border-slate-50">
          <button 
            type="button"
            onClick={() => router.back()}
            className="flex-1 px-8 py-4 border border-slate-200 rounded-2xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            {t('calibration.batch.cancel_back')}
          </button>
          <button 
            disabled={isSubmitting}
            type="submit"
            className="flex-2 px-8 py-4 bg-kst-blue text-white rounded-2xl text-sm font-bold hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-xl shadow-blue-500/20"
          >
            {isSubmitting ? t('calibration.cal.processing') : (
              <>
                <Send className="w-5 h-5" /> {submissionType === 'SENT_OUT' ? t('calibration.batch.create_slip') : t('calibration.batch.confirm_batch_submit')}
              </>
            )}
          </button>
        </footer>
      </form>
    </div>
  );
}
