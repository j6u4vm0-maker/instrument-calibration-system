'use client';

import { useState } from "react";
import { 
  X, 
  Plus, 
  Save, 
  Info, 
  Settings2, 
  ShieldCheck,
  UploadCloud
} from "lucide-react";
import { createFixtureAction } from "@/app/actions/fixture-actions";
import { uploadReportAction } from "@/app/actions/upload-actions";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useRouter } from "next/navigation";
import { GageOrganizationSelector as FixtureOrganizationSelector } from "./GageOrganizationSelector";

export default function FixtureAddModal() {
  const { t } = useLanguage();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [category] = useState("檢具");
  const [status, setStatus] = useState("IN_USE");
  const [acceptance, setAcceptance] = useState("");
  const [calPoints, setCalPoints] = useState("FAI尺寸");
  const [cycle, setCycle] = useState(12);
  const [notes, setNotes] = useState("");
  const [manualVal, setManualVal] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const handleManualUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", e.target.files[0]);
      const url = await uploadReportAction(formData);
      if (url) {
        setManualVal(url);
      }
    } catch(e) {
      alert("上傳失敗");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    
    const quantity = parseInt(formData.get('quantity') as string) || 1;
    const baseId = formData.get('id') as string;
    const baseSerialNo = formData.get('serialNo') as string;

    const dataTemplate = {
      name: formData.get('name') as string,
      applicablePart: formData.get('applicablePart') as string,
      drawingNo: formData.get('drawingNo') as string,
      manual: formData.get('manual') as string,
      category: category,
      brand: formData.get('brand') as string,
      displayType: formData.get('displayType') as string,
      precision: "",
      calibrationCycle: cycle,
      standardId: null,
      acceptance: acceptance,
      calPoints: calPoints,
      locationId: (formData.get('locationId') as string) || null,
      departmentId: (formData.get('departmentId') as string) || null,
      custodianId: (formData.get('custodianId') as string) || null,
      managerId: (formData.get('managerId') as string) || null,
      rdIssuerId: (formData.get('rdIssuerId') as string) || null,
      vendorId: (formData.get('vendorId') as string) || null,
      notes: notes,
      status: status,
      entryDate: formData.get('entryDate') ? new Date(formData.get('entryDate') as string) : new Date(),
      lastCalDate: formData.get('lastCalDate') ? new Date(formData.get('lastCalDate') as string) : new Date(),
    };

    try {
      if (quantity === 1) {
        const data = { ...dataTemplate, id: baseId, serialNo: baseSerialNo };
        const res = await createFixtureAction(data as any);
        if (!res?.success) throw new Error(res?.error || "Creation failed");
      } else {
        for (let i = 1; i <= quantity; i++) {
          const newId = `${baseId}(${i})`;
          const newSerialNo = baseSerialNo ? `${baseSerialNo}(${i})` : `(${i})`;
          const data = { ...dataTemplate, id: newId, serialNo: newSerialNo };
          const res = await createFixtureAction(data as any);
          if (!res?.success) throw new Error(res?.error || `Creation failed for ${newId}`);
        }
      }
      setIsOpen(false);
      router.refresh();
    } catch (error: any) {
      console.error(error);
      alert("Error creating instrument: " + (error.message || "Unknown error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const labelStyle = "block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2";
  const inputStyle = "w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-kst-blue/20 focus:bg-white focus:border-kst-blue outline-none transition-all";

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2.5 bg-kst-blue text-white rounded-xl font-black hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95"
      >
        <Plus className="w-5 h-5" />
        <span>新增檢具</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in duration-200 flex flex-col h-[90vh]">
            
            <header className="px-8 py-5 bg-slate-100 border-b border-slate-200 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-kst-blue rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
                  <ShieldCheck className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-black text-slate-800 text-lg uppercase tracking-tight">新增檢具</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">註冊新設備至系統</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </header>

            <form id="addFixtureForm" onSubmit={handleSubmit} className="flex-1 overflow-y-auto overflow-x-hidden p-8 space-y-10 custom-scrollbar">
              
              {/* --- SECTION 0: 識別與基本資訊 --- */}
              <section className="space-y-5">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                  <Info className="w-4 h-4 text-kst-blue" />
                  <h4 className="text-xs font-black text-kst-blue uppercase tracking-widest">基本資訊</h4>
                </div>
                
                <div className="flex flex-wrap -mx-3">
                  <div className="w-full md:w-1/2 px-3 mb-5">
                    <label className={labelStyle}>設備編號字首</label>
                    <input required type="text" name="id" placeholder="例如：I001-01" className={`${inputStyle} font-mono font-bold`} />
                  </div>
                  <div className="w-full md:w-1/2 px-3 mb-5">
                    <label className={labelStyle}>組數 (批次新增)</label>
                    <input required type="number" name="quantity" defaultValue={1} min={1} className={inputStyle} />
                  </div>
                  <div className="w-full md:w-1/2 px-3 mb-5">
                    <label className={labelStyle}>版次/序號字首</label>
                    <input type="text" name="serialNo" placeholder="留白則自動編為(1),(2)..." className={inputStyle} />
                  </div>
                  <div className="w-full md:w-1/2 px-3 mb-5">
                    <label className={labelStyle}>儀器設備名稱</label>
                    <input required type="text" name="name" className={inputStyle} />
                  </div>
                  <div className="w-full md:w-1/2 px-3 mb-5">
                    <label className={labelStyle}>適用料號</label>
                    <input type="text" name="applicablePart" className={inputStyle} />
                  </div>
                  <div className="w-full md:w-1/2 px-3 mb-5">
                    <label className={labelStyle}>對應圖號 / 檢驗書</label>
                    <input type="text" name="drawingNo" className={inputStyle} />
                  </div>
                  <div className="w-full md:w-1/2 px-3 mb-5">
                    <label className={labelStyle}>使用說明書</label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        name="manual" 
                        value={manualVal}
                        onChange={e => setManualVal(e.target.value)}
                        placeholder="可輸入連結或說明書編號" 
                        className={inputStyle} 
                      />
                      <label title="上傳說明書檔案" className={`shrink-0 flex items-center justify-center px-4 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
                        <UploadCloud className="w-4 h-4 text-slate-500" />
                        <input type="file" className="hidden" onChange={handleManualUpload} />
                      </label>
                    </div>
                  </div>
                  <div className="w-full md:w-1/2 px-3 mb-5">
                    <label className={labelStyle}>廠牌</label>
                    <input type="text" name="brand" className={inputStyle} />
                  </div>
                  <div className="w-full md:w-1/2 px-3 mb-5">
                    <label className={labelStyle}>入廠日期 (RD發行)</label>
                    <input type="date" name="entryDate" className={inputStyle} />
                  </div>
                </div>
              </section>

              {/* --- SECTION 2: 組織歸屬 --- */}
              <section className="space-y-5">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                  <Info className="w-4 h-4 text-kst-blue" />
                  <h4 className="text-xs font-black text-kst-blue uppercase tracking-widest">組織歸屬與保管</h4>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-100 p-6">
                  <FixtureOrganizationSelector />
                </div>
              </section>

              {/* --- SECTION 3: 技術規格與週期 --- */}
              <section className="space-y-5">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                  <Settings2 className="w-4 h-4 text-kst-blue" />
                  <h4 className="text-xs font-black text-kst-blue uppercase tracking-widest">技術規格與週期</h4>
                </div>

                <div className="rounded-2xl border border-blue-200 bg-blue-100/60 p-6">
                <div className="flex flex-wrap -mx-3">
                  <div className="w-full md:w-1/2 px-3 mb-5">
                    <label className={`${labelStyle} flex justify-between items-center`}>
                      <span>{t('calibration.fixture.cycle')} (月)</span>
                      <div className="flex gap-1">
                        {[12, 24, 36].map(m => (
                          <button
                            key={m}
                            type="button"
                            onClick={() => setCycle(m)}
                            className={`text-[9px] px-2 py-0.5 rounded-md border font-black transition-all ${
                              cycle === m 
                                ? 'bg-kst-blue text-white border-kst-blue shadow-sm' 
                                : 'bg-white text-slate-400 border-slate-200 hover:border-kst-blue hover:text-kst-blue'
                            }`}
                          >
                            {m/12}年
                          </button>
                        ))}
                      </div>
                    </label>
                    <input required type="number" name="calibrationCycle" value={cycle} onChange={(e) => setCycle(parseInt(e.target.value) || 0)} className={inputStyle} />
                  </div>
                  <div className="w-full md:w-1/2 px-3 mb-5">
                    <label className={labelStyle}>上次校正日</label>
                    <input type="date" name="lastCalDate" className={inputStyle} />
                  </div>
                  <div className="w-full px-3">
                    <label className={labelStyle}>校正點位</label>
                    <textarea
                      value={calPoints}
                      onChange={(e) => setCalPoints(e.target.value)}
                      placeholder="FAI尺寸"
                      className={`${inputStyle} min-h-[96px] resize-y`}
                    />
                    <p className="mt-2 text-xs text-slate-500">
                      預設為 FAI尺寸，如有需要可直接修改。
                    </p>
                  </div>
                </div>
                </div>
              </section>

              {/* --- SECTION 3.5: 備註 --- */}
              <section className="space-y-5">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                  <Info className="w-4 h-4 text-kst-blue" />
                  <h4 className="text-xs font-black text-kst-blue uppercase tracking-widest">{t('common.common.notes')}</h4>
                </div>
                <div className="bg-slate-100 p-6 rounded-2xl border border-slate-200">
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="輸入設備備註資訊..."
                    className={`${inputStyle} h-24 resize-none`}
                  />
                </div>
              </section>

              <div className="pb-10" />
            </form>

            <footer className="px-8 py-5 bg-slate-100 border-t border-slate-200 flex items-center gap-4 shrink-0">
              <button 
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-6 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all"
              >
                {t('common.common.cancel')}
              </button>

              <div className="flex-1" />

              <button 
                disabled={isSubmitting}
                form="addFixtureForm"
                type="submit"
                className="px-10 py-2.5 bg-kst-blue text-white rounded-xl text-sm font-black hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 flex items-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? '處理中...' : (
                  <>
                    <Save className="w-4 h-4" />
                    新增檢具
                  </>
                )}
              </button>
            </footer>
          </div>
        </div>
      )}
    </>
  );
}
