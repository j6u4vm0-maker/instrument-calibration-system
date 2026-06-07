'use client';

import { useState, useEffect } from "react";
import { 
  X, 
  Save, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  Info, 
  Settings2, 
  FileText 
} from "lucide-react";
import { updateGageAction, deleteGageAction, getCategoriesAction } from "@/app/actions/gage-actions";
import { getAllAcceptanceStandardsAction } from "@/app/actions/standard-actions";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useRouter } from "next/navigation";
import { SearchableSelect } from "./SearchableSelect";
import { GageOrganizationSelector } from "./GageOrganizationSelector";
import { CriteriaEditor, PointsEditor } from "./GageDataTables";

interface GageEditModalProps {
  gage: any;
}

export default function GageEditModal({ gage }: GageEditModalProps) {
  const { t } = useLanguage();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [category, setCategory] = useState(gage.category);
  const [status, setStatus] = useState(gage.status || "IN_USE");
  const [allCategories, setAllCategories] = useState<string[]>([]);
  const [standards, setStandards] = useState<any[]>([]);
  const [standardId, setStandardId] = useState(gage.standardId || "");
  const [acceptance, setAcceptance] = useState(gage.acceptance || "");
  const [calPoints, setCalPoints] = useState(gage.calPoints || "");
  const [cycle, setCycle] = useState(gage.calibrationCycle);
  const [precision, setPrecision] = useState(gage.precision || "");
  const [notes, setNotes] = useState(gage.notes || "");

  useEffect(() => {
    if (isOpen) {
      const loadData = async () => {
        const [cats, stds] = await Promise.all([
          getCategoriesAction(),
          getAllAcceptanceStandardsAction()
        ]);
        setAllCategories(cats as string[]);
        setStandards(stds);
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
      category: category,
      spec: formData.get('spec') as string,
      precision: precision,
      usageRange: (formData.get('usageRange') as string) || null,
      capacity: (formData.get('capacity') as string) || null,
      calibrationCycle: parseInt(formData.get('calibrationCycle') as string) || 12,
      standardId: standardId || null,
      acceptance: acceptance,
      calPoints: calPoints,
      lastCalDate: formData.get('lastCalDate') ? new Date(formData.get('lastCalDate') as string).toISOString() : undefined,
      locationId: (formData.get('locationId') as string) || null,
      departmentId: (formData.get('departmentId') as string) || null,
      custodianId: (formData.get('custodianId') as string) || null,
      managerId: (formData.get('managerId') as string) || null,
      vendorId: (formData.get('vendorId') as string) || null,
      notes: notes,
      status: status,
    };

    try {
      const res = await updateGageAction(gage.id, data);
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
        className="p-1.5 text-kst-blue hover:bg-blue-50 rounded-lg transition-all border border-blue-100 flex items-center justify-center"
        title={t('calibration.gage.edit')}
      >
        <Edit3 className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in duration-200 flex flex-col h-[90vh]">
            
            <header className="px-8 py-5 bg-slate-50 border-b border-slate-100 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-kst-blue rounded-xl flex items-center justify-center shadow-lg shadow-blue-100">
                  <Edit3 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-black text-slate-800 text-lg flex items-center gap-2">
                    {t('calibration.gage.edit')} 
                    <span className="text-kst-blue font-mono">({gage.id})</span>
                  </h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Update instrument configuration</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </header>

            <form id="editGageForm" onSubmit={handleSubmit} className="flex-1 overflow-y-auto overflow-x-hidden p-8 space-y-10 custom-scrollbar">
              
              {/* --- SECTION 1: 基本資訊 --- */}
              <section className="space-y-5">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                  <Info className="w-4 h-4 text-kst-blue" />
                  <h4 className="text-xs font-black text-kst-blue uppercase tracking-widest">{t('cal.basic_info')}</h4>
                </div>
                
                <div className="flex flex-wrap -mx-3">
                  <div className="w-full md:w-1/2 px-3 mb-5">
                    <label className={labelStyle}>{t('calibration.gage.name')}</label>
                    <input required type="text" name="name" defaultValue={gage.name} className={inputStyle} />
                  </div>
                  <div className="w-full md:w-1/2 px-3 mb-5">
                    <label className={labelStyle}>{t('calibration.gage.category')}</label>
                    <SearchableSelect options={allCategories} value={category} onChange={setCategory} placeholder="例如：游標卡尺" />
                  </div>
                  <div className="w-full md:w-1/2 px-3 mb-5">
                    <label className={labelStyle}>{t('common.common.status')}</label>
                    <div className="relative">
                      <select 
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className={`${inputStyle} appearance-none pr-10`}
                      >
                        <option value="IN_USE">{t('common.status.in_use') || '使用中'}</option>
                        <option value="SUSPENDED">{t('common.status.suspended') || '暫停使用'}</option>
                        <option value="SCRAPPED">{t('common.status.scrapped') || '報廢'}</option>
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">▼</div>
                    </div>
                  </div>
                  <div className="w-full px-3">
                    <label className={labelStyle}>{t('calibration.gage.spec')}</label>
                    <input type="text" name="spec" defaultValue={gage.spec} className={inputStyle} />
                  </div>
                </div>
              </section>

              {/* --- SECTION 2: 技術規格與週期 (包含標準庫套用) --- */}
              <section className="space-y-5">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                  <Settings2 className="w-4 h-4 text-kst-blue" />
                  <h4 className="text-xs font-black text-kst-blue uppercase tracking-widest">技術規格與週期</h4>
                </div>

                <div className="bg-blue-50/30 p-5 rounded-2xl border border-blue-100/50 space-y-4">
                  <div className="space-y-2">
                    <label className={labelStyle}>快速套用標準庫 (Standard Library)</label>
                    <div className="flex gap-3">
                      <div className="flex-1 relative">
                        <select 
                          value={standardId}
                          onChange={(e) => setStandardId(e.target.value)}
                          className={`${inputStyle} appearance-none pr-10`}
                        >
                          <option value="">-- {t('calibration.cal.internal_standard')} --</option>
                          {standards.map((s: any) => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                          ))}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">▼</div>
                      </div>
                      {standardId && (
                        <button
                          type="button"
                          onClick={() => {
                            const std = standards.find(s => s.id === standardId);
                            if (std) {
                              if (std.points && std.points.length > 0) {
                                const ptsStr = std.points.map((p: any) => `${p.category}: ${p.points}`).join('\n');
                                setCalPoints(ptsStr);
                              }
                              if (std.criteria && std.criteria.length > 0) {
                                const desc = std.criteria.map((c: any) => 
                                  `${c.category || ''} ${c.rangeStart}-${c.rangeEnd}${c.unit || ''}: +${c.tolerancePlus}/-${Math.abs(c.toleranceMinus)}`
                                ).join('\n');
                                setAcceptance(desc);
                              }
                              if (std.defaultCycle) {
                                setCycle(std.defaultCycle);
                              }
                              if (std.defaultPrecision) {
                                setPrecision(std.defaultPrecision);
                              }
                              if (std.targetCategory) {
                                setCategory(std.targetCategory);
                              }
                            }
                          }}
                          className="px-6 py-2 bg-kst-blue text-white rounded-xl text-sm font-black hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-100"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          {t('calibration.cal.apply_points')}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-wrap -mx-3">
                  <div className="w-full md:w-1/2 px-3 mb-5">
                    <label className={labelStyle}>{t('calibration.gage.precision')}</label>
                    <input 
                      type="text" 
                      name="precision" 
                      value={precision}
                      onChange={(e) => setPrecision(e.target.value)}
                      className={inputStyle} 
                    />
                  </div>
                  <div className="w-full md:w-1/2 px-3 mb-5">
                    <label className={labelStyle}>{t('calibration.gage.range')}</label>
                    <input 
                      type="text" 
                      name="usageRange" 
                      defaultValue={gage.usageRange || ''}
                      className={inputStyle} 
                      placeholder="例如：0~150mm"
                    />
                  </div>
                  <div className="w-full md:w-1/2 px-3 mb-5">
                    <label className={labelStyle}>{t('calibration.gage.capacity')}</label>
                    <input 
                      type="text" 
                      name="capacity" 
                      defaultValue={gage.capacity || ''}
                      className={inputStyle} 
                      placeholder="例如：250g"
                    />
                  </div>
                  <div className="w-full md:w-1/2 px-3 mb-5">
                    <label className={`${labelStyle} flex justify-between items-center`}>
                      <span>{t('calibration.gage.cycle')} (月)</span>
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
                      defaultValue={gage.lastCalDate ? new Date(gage.lastCalDate).toISOString().split('T')[0] : ''}
                      className={inputStyle} 
                    />
                  </div>
                </div>
              </section>

              {/* --- SECTION 3: 校正標準 --- */}
              <section className="space-y-5">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                  <FileText className="w-4 h-4 text-kst-blue" />
                  <h4 className="text-xs font-black text-kst-blue uppercase tracking-widest">校正判定與點位</h4>
                </div>
                
                <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100 space-y-6">
                  <div className="grid grid-cols-1 gap-6">
                    <div className="space-y-2">
                      <label className={labelStyle}>{t('calibration.gage.acceptance')}</label>
                      <CriteriaEditor value={acceptance} onChange={setAcceptance} />
                    </div>
                    <div className="space-y-2">
                      <label className={labelStyle}>{t('calibration.gage.points')}</label>
                      <PointsEditor value={calPoints} onChange={setCalPoints} />
                    </div>
                  </div>
                </div>
              </section>

              {/* --- SECTION 3.5: 備註 --- */}
              <section className="space-y-5">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                  <FileText className="w-4 h-4 text-kst-blue" />
                  <h4 className="text-xs font-black text-kst-blue uppercase tracking-widest">{t('common.common.notes')}</h4>
                </div>
                <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="輸入設備備註資訊..."
                    className={`${inputStyle} h-24 resize-none`}
                  />
                </div>
              </section>

              {/* --- SECTION 4: 組織歸屬 --- */}
              <section className="space-y-5 pb-10">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                  <Info className="w-4 h-4 text-kst-blue" />
                  <h4 className="text-xs font-black text-kst-blue uppercase tracking-widest">組織歸屬與保管</h4>
                </div>
                <GageOrganizationSelector 
                  initialData={{
                    locationId: gage.locationId || undefined,
                    departmentId: gage.departmentId || undefined,
                    custodianId: gage.custodianId || undefined,
                    managerId: gage.managerId || undefined,
                    rdIssuerId: gage.rdIssuerId || undefined,
                    vendorId: gage.vendorId || undefined,
                  }} 
                />
              </section>
            </form>

            <footer className="px-8 py-5 bg-slate-50 border-t border-slate-100 flex items-center gap-4 shrink-0">
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
                  if (confirm(t('calibration.gage.confirm_del').replace('{{id}}', gage.id))) {
                    const res = await deleteGageAction(gage.id);
                    if (res.success) {
                      setIsOpen(false);
                      router.push('/gages');
                      router.refresh();
                    }
                  }
                }}
                className="p-2.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                title={t('calibration.gage.delete')}
              >
                <Trash2 className="w-5 h-5" />
              </button>

              <div className="flex-1" />

              <button 
                disabled={isSubmitting}
                form="editGageForm"
                type="submit"
                className="px-10 py-2.5 bg-kst-blue text-white rounded-xl text-sm font-black hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 flex items-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? t('calibration.cal.processing') : (
                  <>
                    <Save className="w-4 h-4" />
                    {t('common.common.save_changes')}
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
