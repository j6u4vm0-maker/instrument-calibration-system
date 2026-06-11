'use client';

import { useState } from "react";
import { 
  X, 
  Save, 
  Info, 
  Settings2, 
  FileText,
  Edit2
} from "lucide-react";
import { updateRoundBarAction } from "@/app/actions/roundbar-actions";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useRouter } from "next/navigation";
import { GageOrganizationSelector } from "./GageOrganizationSelector";

export default function RoundBarEditModal({ roundBar }: { roundBar: any }) {
  const { t } = useLanguage();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState(roundBar.status || "IN_USE");
  const [cycle, setCycle] = useState(roundBar.calibrationCycle || 12);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    
    const data = {
      name: formData.get('name') as string,
      spec: formData.get('spec') as string,
      usageRange: formData.get('usageRange') as string,
      calibrationCycle: cycle,
      calPoint1: formData.get('calPoint1') as string,
      calPoint2: formData.get('calPoint2') as string,
      rdIssuer: formData.get('rdIssuer') as string,
      notes: formData.get('notes') as string,
      locationId: (formData.get('locationId') as string) || null,
      departmentId: (formData.get('departmentId') as string) || null,
      managerId: (formData.get('managerId') as string) || null,
      status: status,
      entryDate: formData.get('entryDate') as string || null,
      lastCalDate: formData.get('lastCalDate') as string || null,
      actualCalDate: formData.get('actualCalDate') as string || null,
    };

    try {
      const res = await updateRoundBarAction(roundBar.id, data);
      if (res && res.success) {
        setIsOpen(false);
        router.refresh();
      } else {
        alert(res?.error || "Update failed");
      }
    } catch (error: any) {
      console.error(error);
      alert("Error updating round bar: " + (error.message || "Unknown error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const labelStyle = "block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2";
  const inputStyle = "w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:bg-white focus:border-amber-500 outline-none transition-all";

  // helper to format dates for input fields
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toISOString().split('T')[0];
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-600 tooltip-trigger"
        title={t('roundBar.edit')}
      >
        <Edit2 className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 text-left">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
          
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-amber-50/30">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 rounded-xl">
                  <Edit2 className="w-5 h-5 text-amber-600" />
                </div>
                <h2 className="text-xl font-bold text-slate-800 tracking-tight">{t('roundBar.edit')} - {roundBar.id}</h2>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8">
              <div className="space-y-10">
                {/* 1. Basic Info */}
                <section>
                  <div className="flex items-center gap-2 mb-6">
                    <Info className="w-4 h-4 text-amber-500" />
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">{t('common.common.basic_info')}</h3>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6 p-6 bg-slate-50/50 rounded-2xl border border-slate-100">
                    <div>
                      <label className={labelStyle}>{t('roundBar.id')}</label>
                      <input value={roundBar.id} disabled className={`${inputStyle} bg-slate-100 opacity-60 cursor-not-allowed`} />
                    </div>
                    <div>
                      <label className={labelStyle}>{t('roundBar.name')}</label>
                      <input name="name" required defaultValue={roundBar.name} className={inputStyle} />
                    </div>
                    <div>
                      <label className={labelStyle}>{t('roundBar.spec')}</label>
                      <input name="spec" defaultValue={roundBar.spec} className={inputStyle} />
                    </div>
                    <div>
                      <label className={labelStyle}>{t('roundBar.usageRange')}</label>
                      <input name="usageRange" defaultValue={roundBar.usageRange} className={inputStyle} />
                    </div>
                  </div>
                </section>

                {/* 2. Organization Info */}
                <section>
                  <div className="flex items-center gap-2 mb-6">
                    <Settings2 className="w-4 h-4 text-amber-500" />
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">{t('common.common.organization')}</h3>
                  </div>
                  <div className="p-6 bg-slate-50/50 rounded-2xl border border-slate-100">
                    <GageOrganizationSelector 
                      defaultLocationId={roundBar.locationId}
                      defaultDepartmentId={roundBar.departmentId}
                      defaultManagerId={roundBar.managerId}
                    />
                    
                    <div className="mt-6">
                      <label className={labelStyle}>{t('roundBar.rdIssuer')}</label>
                      <input name="rdIssuer" defaultValue={roundBar.rdIssuer} className={inputStyle} />
                    </div>
                  </div>
                </section>

                {/* 3. Calibration Details */}
                <section>
                  <div className="flex items-center gap-2 mb-6">
                    <FileText className="w-4 h-4 text-amber-500" />
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">{t('common.common.cal_setup')}</h3>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6 p-6 bg-slate-50/50 rounded-2xl border border-slate-100">
                    <div>
                      <label className={labelStyle}>{t('roundBar.calibrationCycle')}</label>
                      <div className="flex items-center gap-3">
                        <input 
                          type="range" min="1" max="60" value={cycle}
                          onChange={(e) => setCycle(Number(e.target.value))}
                          className="flex-1 accent-amber-500"
                        />
                        <div className="px-4 py-2 bg-white rounded-xl border border-slate-200 text-sm font-medium w-24 text-center">
                          {cycle} {t('common.common.months')}
                        </div>
                      </div>
                    </div>
                    
                    <div className="col-span-2 grid grid-cols-2 gap-6">
                      <div>
                        <label className={labelStyle}>{t('roundBar.calPoint1')}</label>
                        <input name="calPoint1" defaultValue={roundBar.calPoint1} className={inputStyle} />
                      </div>
                      <div>
                        <label className={labelStyle}>{t('roundBar.calPoint2')}</label>
                        <input name="calPoint2" defaultValue={roundBar.calPoint2} className={inputStyle} />
                      </div>
                    </div>

                    <div>
                      <label className={labelStyle}>{t('roundBar.entryDate')}</label>
                      <input name="entryDate" type="date" defaultValue={formatDate(roundBar.entryDate)} className={inputStyle} />
                    </div>

                    <div>
                      <label className={labelStyle}>{t('roundBar.lastCalDate')}</label>
                      <input name="lastCalDate" type="date" required defaultValue={formatDate(roundBar.lastCalDate)} className={inputStyle} />
                    </div>

                    <div className="col-span-2">
                      <label className={labelStyle}>{t('roundBar.notes')}</label>
                      <textarea name="notes" rows={3} defaultValue={roundBar.notes} className={`${inputStyle} resize-none`} />
                    </div>
                  </div>
                </section>
              </div>

              {/* Form Actions */}
              <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between sticky bottom-0 bg-white p-4">
                <div className="flex gap-2">
                  {['IN_USE', 'SCRAPPED', 'REPAIR'].map((s) => (
                    <button
                      key={s} type="button"
                      onClick={() => setStatus(s)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                        status === s 
                          ? 'bg-amber-500 text-white shadow-md' 
                          : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                      }`}
                    >
                      {t(`status.${s.toLowerCase()}`)}
                    </button>
                  ))}
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="px-6 py-2.5 text-slate-500 font-medium hover:bg-slate-50 rounded-xl transition-colors text-sm"
                  >
                    {t('common.common.cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center gap-2 px-8 py-2.5 bg-amber-500 text-white rounded-xl font-bold shadow-md hover:shadow-xl hover:bg-amber-600 transition-all disabled:opacity-50 text-sm"
                  >
                    <Save className="w-4 h-4" />
                    {isSubmitting ? t('common.common.saving') : t('common.common.save')}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
