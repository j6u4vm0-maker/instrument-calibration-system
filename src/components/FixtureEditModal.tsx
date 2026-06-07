'use client';

import { useState, useEffect } from "react";
import { 
  X, 
  Save, 
  Trash2, 
  Edit3, 
  Info, 
  Settings2, 
  UploadCloud
} from "lucide-react";
import { updateFixtureAction, deleteFixtureAction, getCategoriesAction } from "@/app/actions/fixture-actions";
import { uploadReportAction } from "@/app/actions/upload-actions";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useRouter } from "next/navigation";
import { SearchableSelect } from "./SearchableSelect";
import { GageOrganizationSelector as FixtureOrganizationSelector } from "./GageOrganizationSelector";

interface FixtureEditModalProps {
  fixture: any;
}

export default function FixtureEditModal({ fixture }: FixtureEditModalProps) {
  const { t } = useLanguage();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [category, setCategory] = useState(fixture.category);
  const [status, setStatus] = useState(fixture.status || "IN_USE");
  const [allCategories, setAllCategories] = useState<string[]>([]);
  const [acceptance, setAcceptance] = useState(fixture.acceptance || "");
  const [calPoints, setCalPoints] = useState(fixture.calPoints || "FAI尺寸");
  const [cycle, setCycle] = useState(fixture.calibrationCycle);
  const [notes, setNotes] = useState(fixture.notes || "");
  const [manualVal, setManualVal] = useState(fixture.manual || "");
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

  useEffect(() => {
    if (isOpen) {
      const loadData = async () => {
        const cats = await getCategoriesAction();
        setAllCategories(cats as string[]);
      };
      loadData();
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    
    const data = {
      name: formData.get('name') as string,
      serialNo: formData.get('serialNo') as string,
      applicablePart: formData.get('applicablePart') as string,
      drawingNo: formData.get('drawingNo') as string,
      manual: formData.get('manual') as string,
      brand: formData.get('brand') as string,
      displayType: formData.get('displayType') as string,
      category: category,
      precision: fixture.precision || "",
      // usageRange 和 capacity 不在 Fixture schema 中，僅存在於 Gage model，故移除
      calibrationCycle: parseInt(formData.get('calibrationCycle') as string) || 12,
      standardId: fixture.standardId || null,
      acceptance: acceptance,
      calPoints: calPoints,
      lastCalDate: formData.get('lastCalDate') ? new Date(formData.get('lastCalDate') as string).toISOString() : undefined,
      locationId: (formData.get('locationId') as string) || null,
      departmentId: (formData.get('departmentId') as string) || null,
      custodianId: (formData.get('custodianId') as string) || null,
      managerId: (formData.get('managerId') as string) || null,
      rdIssuerId: (formData.get('rdIssuerId') as string) || null,
      vendorId: (formData.get('vendorId') as string) || null,
      notes: notes,
      status: status,
      entryDate: formData.get('entryDate') ? new Date(formData.get('entryDate') as string) : new Date(),
    };

    try {
      const res = await updateFixtureAction(fixture.id, data);
      if (res && res.success) {
        setIsOpen(false);
        router.refresh();
      } else {
        alert(res?.error || "Update failed");
      }
    } catch (error: any) {
      console.error(error);
      alert("Error updating instrument: " + (error.message || "Unknown error"));
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
        title="編輯檢具"
      >
        <Edit3 className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in duration-200 flex flex-col h-[90vh]">
            
            <header className="px-8 py-5 bg-slate-100 border-b border-slate-200 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-kst-blue rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
                  <Edit3 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-black text-slate-800 text-lg flex items-center gap-2">
                    編輯檢具 
                    <span className="text-kst-blue font-mono">({fixture.id})</span>
                  </h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">更新檢具設定</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </header>

            <form id="editFixtureForm" onSubmit={handleSubmit} className="flex-1 overflow-y-auto overflow-x-hidden p-8 space-y-10 custom-scrollbar">
              
              {/* --- SECTION 1: 基本資訊 --- */}
              <section className="space-y-5">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                  <Info className="w-4 h-4 text-kst-blue" />
                  <h4 className="text-xs font-black text-kst-blue uppercase tracking-widest">基本資訊</h4>
                </div>
                
                <div className="flex flex-wrap -mx-3">
                  <div className="w-full md:w-1/2 px-3 mb-5">
                    <label className={labelStyle}>儀器設備名稱</label>
                    <input required type="text" name="name" defaultValue={fixture.name} className={inputStyle} />
                  </div>
                  <div className="w-full md:w-1/2 px-3 mb-5">
                    <label className={labelStyle}>版次/序號</label>
                    <input type="text" name="serialNo" defaultValue={fixture.serialNo} placeholder="例如：(1)" className={inputStyle} />
                  </div>
                  <div className="w-full md:w-1/2 px-3 mb-5">
                    <label className={labelStyle}>適用料號</label>
                    <input type="text" name="applicablePart" defaultValue={fixture.applicablePart} className={inputStyle} />
                  </div>
                  <div className="w-full md:w-1/2 px-3 mb-5">
                    <label className={labelStyle}>對應圖號 / 檢驗書</label>
                    <input type="text" name="drawingNo" defaultValue={fixture.drawingNo} className={inputStyle} />
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
                    <input type="text" name="brand" defaultValue={fixture.brand} className={inputStyle} />
                  </div>
                  <div className="w-full md:w-1/2 px-3 mb-5">
                    <label className={labelStyle}>入廠日期 (RD發行)</label>
                    <input type="date" name="entryDate" defaultValue={fixture.entryDate ? new Date(fixture.entryDate).toISOString().split('T')[0] : ''} className={inputStyle} />
                  </div>
                  <div className="w-full px-3">
                    <label className={labelStyle}>類別 (選填)</label>
                    <SearchableSelect options={allCategories} value={category} onChange={setCategory} placeholder="例如：檢具" />
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
                  <FixtureOrganizationSelector 
                    initialData={{
                      locationId: fixture.locationId || undefined,
                      departmentId: fixture.departmentId || undefined,
                      custodianId: fixture.custodianId || undefined,
                      managerId: fixture.managerId || undefined,
                      rdIssuerId: fixture.rdIssuerId || undefined,
                      vendorId: fixture.vendorId || undefined,
                    }} 
                  />
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
                    <input 
                      type="date" 
                      name="lastCalDate" 
                      defaultValue={fixture.lastCalDate ? new Date(fixture.lastCalDate).toISOString().split('T')[0] : ''}
                      className={inputStyle} 
                    />
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
              
              <button 
                type="button"
                onClick={async () => {
                  if (confirm(t('calibration.fixture.confirm_del').replace('{{id}}', fixture.id))) {
                    const res = await deleteFixtureAction(fixture.id);
                    if (res.success) {
                      setIsOpen(false);
                      router.push('/fixtures');
                      router.refresh();
                    }
                  }
                }}
                className="p-2.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                title={t('calibration.fixture.delete')}
              >
                <Trash2 className="w-5 h-5" />
              </button>

              <div className="flex-1" />

              <button 
                disabled={isSubmitting}
                form="editFixtureForm"
                type="submit"
                className="px-10 py-2.5 bg-kst-blue text-white rounded-xl text-sm font-black hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 flex items-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? '處理中...' : (
                  <>
                    <Save className="w-4 h-4" />
                    儲存變更
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
