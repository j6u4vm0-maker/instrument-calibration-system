"use client";

import { useState } from "react";
import { X, Save, Edit3, MapPin, Building2, User, Activity, ShieldCheck, FileText } from "lucide-react";
import { batchUpdateGagesAction, getCategoriesAction } from "@/app/actions/gage-actions";
import { batchUpdateFixturesAction, getCategoriesAction as getFixtureCategoriesAction } from "@/app/actions/fixture-actions";
import { getAllCategoriesAction } from "@/app/actions/category-actions";
import { getAllLocationsAction } from "@/app/actions/org-actions";
import { getAllAcceptanceStandardsAction } from "@/app/actions/standard-actions";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useEffect, useMemo } from "react";
import { SearchableObjectSelect, SelectOption } from "./SearchableObjectSelect";
import { SearchableSelect } from "./SearchableSelect";

interface BatchEditModalProps {
  selectedIds: string[];
  onSuccess: () => void;
  type?: 'gage' | 'fixture';
}

export default function BatchEditModal({ selectedIds, onSuccess, type = 'gage' }: BatchEditModalProps) {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orgData, setOrgData] = useState<any[]>([]);
  const [standards, setStandards] = useState<any[]>([]);
  const [allCategories, setAllCategories] = useState<string[]>([]);

  // Selection states
  const [locId, setLocId] = useState("");
  const [deptId, setDeptId] = useState("");
  const [custId, setCustId] = useState("");
  const [mgrId, setMgrId] = useState("");
  const [stdId, setStdId] = useState("");
  const [category, setCategory] = useState("");
  const [cycle, setCycle] = useState<number | "">("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (isOpen) {
      const load = async () => {
        const [locations, stds, cats] = await Promise.all([
          getAllLocationsAction(),
          getAllAcceptanceStandardsAction(),
          type === 'fixture' ? getAllCategoriesAction() : getCategoriesAction()
        ]);
        setOrgData(locations);
        setStandards(stds);
        // For fixtures, use category names from the GageCategory table
        if (type === 'fixture') {
          const catNames = (cats as any[]).map((c: any) => c.name).filter(Boolean);
          setAllCategories(catNames);
        } else {
          setAllCategories(cats as string[]);
        }
      };
      load();
    }
  }, [isOpen, type]);

  // Flattened options for searching
  const staffOptions = useMemo<SelectOption[]>(() => {
    const options: SelectOption[] = [];
    orgData.forEach(loc => {
      loc.departments.forEach((dept: any) => {
        dept.staff.forEach((s: any) => {
          options.push({
            label: s.name,
            value: s.id,
            subLabel: `${loc.name} / ${dept.name}`,
            type: 'staff'
          });
        });
      });
    });
    return options;
  }, [orgData]);

  const custodianOptions = useMemo<SelectOption[]>(() => {
    const options: SelectOption[] = [...staffOptions];
    orgData.forEach(loc => {
      loc.departments.forEach((dept: any) => {
        options.push({
          label: `${dept.name} (${t('quality.org.dept')})`,
          value: `dept_${dept.id}`,
          subLabel: loc.name,
          type: 'dept'
        });
      });
    });
    return options;
  }, [staffOptions, orgData, t]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    const data: any = {};
    formData.forEach((value, key) => {
      if (value && value !== "") {
        if (key === 'calibrationCycle') {
          data[key] = parseInt(value as string);
        } else {
          data[key] = value;
        }
      }
    });

    // Manually add select states if they are set
    if (locId) data.locationId = locId;
    if (deptId) data.departmentId = deptId;
    if (custId) data.custodianId = custId;
    if (mgrId) data.managerId = mgrId;
    if (stdId) data.standardId = stdId;
    if (category) data.category = category;
    if (notes) data.notes = notes;

    if (Object.keys(data).length === 0) {
      alert(t('calibration.batch.at_least_one'));
      setIsSubmitting(false);
      return;
    }

    try {
      if (type === 'fixture') {
        await batchUpdateFixturesAction(selectedIds, data);
      } else {
        await batchUpdateGagesAction(selectedIds, data);
      }
      setIsOpen(false);
      onSuccess();
    } catch (error) {
      alert(t('common.common.error_batch') + ": " + (error instanceof Error ? error.message : "unknown error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-white text-slate-700 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-slate-50 transition-all border border-slate-200 shadow-sm"
      >
        <Edit3 className="w-4 h-4" /> {t('common.common.batch_edit')} ({selectedIds.length})
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[70] flex items-center justify-center p-4 text-left">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
        <header className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center flex-shrink-0">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <Edit3 className="w-5 h-5 text-kst-blue" />
            {t('common.common.batch_edit')} ({selectedIds.length} {t('calibration.gage.total')})
          </h3>
          <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-slate-200 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-6">
          <p className="text-xs text-amber-600 bg-amber-50 p-3 rounded-lg font-medium">
            {t('calibration.batch.edit_hint')}
          </p>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Activity className="w-4 h-4 text-slate-400" /> {t('calibration.gage.cal_type')}
              </label>
              <select 
                name="calType" 
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-kst-blue outline-none bg-white"
              >
                <option value="">{t('common.common.keep_unchanged')}</option>
                <option value="外校">{t('calibration.gage.external')}</option>
                <option value="內校">{t('calibration.gage.internal')}</option>
                <option value="免校正">{t('calibration.gage.non_cal')}</option>
              </select>
            </div>


            <div className="space-y-1.5 col-span-2">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <User className="w-4 h-4 text-slate-400" /> {t('quality.org.custodian')} / {t('quality.org.dept')}
              </label>
              <SearchableObjectSelect 
                options={custodianOptions}
                value={custId ? custId : (deptId ? `dept_${deptId}` : "")}
                placeholder={t('quality.org.select_cust')}
                onChange={(val, opt) => {
                  if (opt?.type === 'staff') {
                    setCustId(val);
                    // Find dept and loc
                    orgData.forEach(loc => {
                      loc.departments.forEach((d: any) => {
                        if (d.staff.some((s: any) => s.id === val)) {
                          setLocId(loc.id);
                          setDeptId(d.id);

                          // Auto-select default inspector for this location
                          const anyInspInLoc = loc.departments.flatMap((dept: any) => dept.staff).find((s: any) => s.isDefaultInspector);
                          if (anyInspInLoc) setMgrId(anyInspInLoc.id);
                        }
                      });
                    });
                  } else if (opt?.type === 'dept') {
                    const actualDeptId = val.replace('dept_', '');
                    setDeptId(actualDeptId);
                    orgData.forEach(loc => {
                      const d = loc.departments.find((d: any) => d.id === actualDeptId);
                      if (d) {
                        setLocId(loc.id);
                        setCustId(d.defaultCustodianId || "");
                        
                        // Auto-select default inspector for this location
                        const defaultInsp = d.staff.find((s: any) => s.isDefaultInspector);
                        if (defaultInsp) {
                          setMgrId(defaultInsp.id);
                        } else {
                          // Search other departments in same location
                          const anyInspInLoc = loc.departments.flatMap((dept: any) => dept.staff).find((s: any) => s.isDefaultInspector);
                          if (anyInspInLoc) setMgrId(anyInspInLoc.id);
                        }
                      }
                    });
                  } else {
                    setCustId("");
                    setDeptId("");
                  }
                }}
              />
            </div>

            <div className="space-y-1.5 col-span-2">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <User className="w-4 h-4 text-slate-400" /> {t('common.settings.engineer')}
              </label>
              <SearchableObjectSelect 
                options={staffOptions}
                value={mgrId}
                placeholder={t('quality.org.select_mgr')}
                onChange={(val) => setMgrId(val)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-400" /> {t('quality.org.factory')}
              </label>
              <select 
                value={locId}
                onChange={(e) => {
                  const newLocId = e.target.value;
                  setLocId(newLocId);
                  setDeptId("");
                  setCustId("");
                  
                  // Auto-select default inspector for this location
                  const loc = orgData.find(l => l.id === newLocId);
                  if (loc) {
                    const defaultInsp = loc.departments.flatMap((d: any) => d.staff).find((s: any) => s.isDefaultInspector);
                    if (defaultInsp) setMgrId(defaultInsp.id);
                  } else {
                    setMgrId("");
                  }
                }}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-kst-blue outline-none bg-white"
              >
                <option value="">{t('common.common.keep_unchanged')}</option>
                {orgData.map(l => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </select>
            </div>

            {type !== 'fixture' && (
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Activity className="w-4 h-4 text-slate-400" /> {t('calibration.gage.category')}
              </label>
              <SearchableSelect 
                options={allCategories}
                value={category}
                onChange={setCategory}
                placeholder={t('common.common.keep_unchanged')}
              />
            </div>
            )}

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-slate-400" /> {t('common.nav.standards')}
              </label>
              <select 
                value={stdId}
                onChange={(e) => setStdId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-kst-blue outline-none bg-white"
              >
                <option value="">{t('common.common.keep_unchanged')}</option>
                {standards.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">{t('common.common.status')}</label>
              <select 
                name="status" 
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-kst-blue outline-none bg-white"
              >
                <option value="">{t('common.common.keep_unchanged')}</option>
                <option value="IN_USE">{t('common.status.in_use')}</option>
                <option value="SUSPENDED">{t('common.status.suspended')}</option>
                <option value="DEACTIVATED">{t('common.status.deactivated')}</option>
                <option value="SCRAPPED">{t('common.status.scrapped')}</option>
              </select>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700 flex justify-between items-center">
                <span>{t('calibration.gage.cycle')} <span className="text-[10px] text-slate-400 font-normal">(月)</span></span>
                <div className="flex gap-1">
                  {[12, 24, 36].map(m => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setCycle(m)}
                      className={`text-[10px] px-1.5 py-0.5 rounded border transition-all ${
                        cycle === m 
                          ? 'bg-kst-blue text-white border-kst-blue' 
                          : 'bg-white text-slate-500 border-slate-200 hover:border-kst-blue'
                      }`}
                    >
                      {m/12}年
                    </button>
                  ))}
                </div>
              </label>
              <input 
                type="number" 
                name="calibrationCycle" 
                value={cycle}
                onChange={(e) => setCycle(e.target.value === "" ? "" : parseInt(e.target.value) || 0)}
                placeholder={t('calibration.batch.enter_cycle')}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-kst-blue outline-none bg-white"
              />
            </div>

            <div className="space-y-1.5 col-span-2">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-400" /> {t('common.common.notes')}
              </label>
              <textarea 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t('calibration.batch.edit_hint')}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-kst-blue outline-none bg-white h-20 resize-none"
              />
            </div>
          </div>

          <footer className="pt-6 flex justify-end gap-3 border-t border-slate-50 flex-shrink-0">
            <button 
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              {t('common.common.cancel')}
            </button>
            <button 
              disabled={isSubmitting}
              type="submit"
              className="px-6 py-2 bg-kst-blue text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-blue-100"
            >
              {isSubmitting ? t('common.common.updating') : (
                <>
                  <Save className="w-4 h-4" /> {t('common.common.save_changes')}
                </>
              )}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}
