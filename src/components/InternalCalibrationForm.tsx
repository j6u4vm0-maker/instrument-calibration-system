"use client";

import { useState, useEffect } from "react";
import { 
  Plus, X, ClipboardList, CheckCircle2, XCircle, 
  Trash2, PlusCircle, ShieldCheck, 
  Save, Send, BookOpen
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { getDefaultInspectorAction } from "@/app/actions/org-actions";
import { Search } from "lucide-react";
import { MasterGageSelector } from "./MasterGageSelector";
import { CalibrationDataTable } from "./CalibrationDataTable";
import { EnvironmentalInputs } from "./EnvironmentalInputs";

interface InternalCalibrationFormProps {
  gageInfo: {
    id: string;
    name: string;
    spec?: string;
    range?: string;
    calPoints: string;
    acceptanceStandard?: any;
  };
  masterGages: any[]; // List of available master gages
  onSubmit: (data: any, status: 'DRAFT' | 'PENDING') => void;
  isSubmitting: boolean;
  initialData?: any;
  onCancel?: () => void;
  isReadOnly?: boolean;
}

export default function InternalCalibrationForm({
  gageInfo,
  masterGages,
  onSubmit,
  isSubmitting,
  initialData,
  onCancel,
  isReadOnly
}: InternalCalibrationFormProps) {
  const { t } = useLanguage();
  
  // Basic Info
  const [calDate, setCalDate] = useState(new Date().toISOString().split('T')[0]);
  const [inspector, setInspector] = useState("");
  const [notes, setNotes] = useState("");
  
  // Environmental Conditions
  const [temperature, setTemperature] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('daily_temp') || "20";
    return "20";
  });
  const [humidity, setHumidity] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('daily_humidity') || "50";
    return "50";
  });
  
  // Master Gages Traceability
  const [selectedMasterIds, setSelectedMasterIds] = useState<string[]>([]);
  const [isMasterModalOpen, setIsMasterModalOpen] = useState(false);
  const [masterSearch, setMasterSearch] = useState("");
  
  // Calibration Details
  const [details, setDetails] = useState<any[]>([]);

  // Initialize details from gageInfo.calPoints or initialData
  useEffect(() => {
    if (initialData?.details && initialData.details.length > 0) {
      setDetails(initialData.details);
      setCalDate(new Date(initialData.calDate).toISOString().split('T')[0]);
      setInspector(initialData.inspector || "");
      let initialNotes = initialData.notes || "";
      
      const envMatch = initialNotes.match(/\[Env:\s*T=([^C]+)C,\s*H=([^%]+)%\]/);
      if (envMatch) {
        setTemperature(envMatch[1].trim());
        setHumidity(envMatch[2].trim());
        initialNotes = initialNotes.replace(/\[Env:.*?\]\s*/, '');
      }

      const mastersMatch = initialNotes.match(/\[Masters:\s*(.*?)\]/);
      if (mastersMatch) {
        const mastersStr = mastersMatch[1].trim();
        if (mastersStr) {
          setSelectedMasterIds(mastersStr.split(',').map((s: string) => s.trim()));
        }
        initialNotes = initialNotes.replace(/\[Masters:.*?\]\s*/, '');
      }

      setNotes(initialNotes.trim());
      
    } else {
      let initialDetails: any[] = [];
      try {
        const parsed = JSON.parse(gageInfo.calPoints);
        if (Array.isArray(parsed)) {
          initialDetails = parsed.map(p => ({
            category: p.category || p.type || "",
            point: p.point || "",
            lowerLimit: p.lowerLimit ?? "",
            upperLimit: p.upperLimit ?? "",
            actual: "",
            error: 0,
            result: "PASS"
          }));
        }
      } catch (e) {
        const points = (gageInfo.calPoints || "").split(/[,，\s]+/).filter(p => p.trim() !== "");
        initialDetails = points.map(p => ({
          category: "",
          point: p,
          lowerLimit: "",
          upperLimit: "",
          actual: "",
          error: 0,
          result: "PASS"
        }));
      }
      setDetails(initialDetails);
    }
  }, [gageInfo, initialData]);
  
  // Auto-fetch default inspector
  useEffect(() => {
    if (!inspector) {
      getDefaultInspectorAction().then(insp => {
        if (insp) setInspector(insp.name);
      });
    }
  }, []);

  const calculateResult = (actual: string, lower: string, upper: string) => {
    const act = parseFloat(actual);
    const low = parseFloat(lower);
    const up = parseFloat(upper);
    if (isNaN(act)) return "PASS";
    let pass = true;
    if (!isNaN(low) && act < low) pass = false;
    if (!isNaN(up) && act > up) pass = false;
    return pass ? "PASS" : "FAIL";
  };

  const handleRowChange = (index: number, field: string, val: string) => {
    const newDetails = [...details];
    newDetails[index][field] = val;

    if (field === 'point' || field === 'actual') {
      const actualNum = parseFloat(newDetails[index].actual);
      const pointNum = parseFloat(newDetails[index].point);
      
      if (!isNaN(actualNum) && !isNaN(pointNum)) {
        newDetails[index].error = parseFloat((actualNum - pointNum).toFixed(4));

        // Auto-fetch tolerance from acceptanceStandard
        if (gageInfo.acceptanceStandard?.criteria) {
          const criterion = gageInfo.acceptanceStandard.criteria.find((c: any) => {
            const matchesCategory = !c.category || c.category === newDetails[index].category;
            const start = c.rangeStart ?? -Infinity;
            const end = c.rangeEnd ?? Infinity;
            return matchesCategory && pointNum >= start && pointNum <= end;
          });

          if (criterion) {
            newDetails[index].lowerLimit = (pointNum + criterion.toleranceMinus).toFixed(4);
            newDetails[index].upperLimit = (pointNum + criterion.tolerancePlus).toFixed(4);
          }
        }
      } else {
        newDetails[index].error = 0;
      }
    }

    newDetails[index].result = calculateResult(
      newDetails[index].actual,
      newDetails[index].lowerLimit,
      newDetails[index].upperLimit
    );
    setDetails(newDetails);
  };

  const addRow = () => {
    setDetails([...details, { category: "", point: "", lowerLimit: "", upperLimit: "", actual: "", error: 0, result: "PASS" }]);
  };

  const removeRow = (index: number) => {
    if (details.length <= 1) return;
    setDetails(details.filter((_, i) => i !== index));
  };

  const handleFormSubmit = (e: React.FormEvent, status: 'DRAFT' | 'PENDING') => {
    e.preventDefault();
    const overallResult = details.every(d => d.result === "PASS") ? "PASS" : "FAIL";

    if (overallResult === "FAIL") {
      const proceed = confirm(t('calibration.cal.ng_alert') || "⚠️ 提醒：此份報告判定為 FAIL (NG)！\n請確認數值是否正確，或是準備後續異常處理。是否確定要繼續送出？");
      if (!proceed) return;
    }
    
    // Combine notes with environmental data
    const combinedNotes = `[Env: T=${temperature}C, H=${humidity}%] [Masters: ${selectedMasterIds.join(", ")}] ${notes}`;

    onSubmit({
      calDate,
      inspector,
      notes: combinedNotes,
      result: overallResult,
      details,
      reportType: 'INTERNAL',
      status,
    }, status);
  };

  const filteredMasterGages = masterGages.filter(g => 
    g.id.toLowerCase().includes(masterSearch.toLowerCase()) ||
    g.name.toLowerCase().includes(masterSearch.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <MasterGageSelector 
        isOpen={isMasterModalOpen}
        onClose={() => setIsMasterModalOpen(false)}
        masterGages={masterGages}
        selectedIds={selectedMasterIds}
        onSelectionChange={setSelectedMasterIds}
      />

      <fieldset disabled={isReadOnly} className="space-y-8 min-w-0 border-0 p-0 m-0">
      {/* 1. Header & Environment */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-slate-50/50 p-6 rounded-2xl border border-slate-100 space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-kst-blue/10 rounded-lg text-kst-blue">
              <ClipboardList className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-800">{t('calibration.cal.basic_info')}</h4>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase">{t('calibration.cal.report_date')}</label>
              <input 
                type="date" 
                value={calDate}
                onChange={(e) => setCalDate(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-kst-blue outline-none disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase">{t('calibration.cal.inspector_label')}</label>
              <input 
                type="text" 
                value={inspector}
                onChange={(e) => setInspector(e.target.value)}
                placeholder={t('calibration.cal.inspector_placeholder')}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-kst-blue outline-none disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        <EnvironmentalInputs 
          temperature={temperature}
          humidity={humidity}
          onUpdate={(upd) => {
            if (upd.temperature !== undefined) setTemperature(upd.temperature);
            if (upd.humidity !== undefined) setHumidity(upd.humidity);
          }}
        />
      </section>

      {/* 2. Master Gages Traceability */}
      <section className="bg-emerald-50/20 p-6 rounded-2xl border border-emerald-100/30 space-y-4">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-800">{t('calibration.cal.traceability')}</h4>
              <p className="text-[10px] text-slate-500 font-medium">{t('calibration.cal.internal_standard')}</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={() => setIsMasterModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition-all shadow-sm"
          >
            <PlusCircle className="w-3.5 h-3.5" /> {t('calibration.cal.add_master')}
          </button>
        </div>
        
        <div className="flex flex-wrap gap-2 min-h-[40px] p-2 bg-white/50 rounded-xl border border-dashed border-emerald-200">
          {selectedMasterIds.length === 0 ? (
            <p className="text-xs text-slate-400 italic p-1">{t('calibration.cal.no_master_selected')}</p>
          ) : (
            selectedMasterIds.map(id => {
              const gage = masterGages.find(g => g.id === id);
              return (
                <div key={id} className="flex items-center gap-2 px-3 py-1.5 bg-emerald-100/50 text-emerald-700 rounded-lg text-xs font-bold border border-emerald-200">
                  <span>{id} {gage?.name}</span>
                  <button onClick={() => setSelectedMasterIds(prev => prev.filter(i => i !== id))}>
                    <X className="w-3 h-3 hover:text-red-500" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* 2.5 Standard Reference */}
      {gageInfo.acceptanceStandard && (
        <section className="bg-blue-50/20 p-6 rounded-2xl border border-blue-100/30 space-y-4 animate-in fade-in slide-in-from-left-4 duration-700">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 text-kst-blue rounded-lg">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-800">{t('calibration.cal.std_reference')}</h4>
                <p className="text-[10px] text-slate-500 font-medium">
                  {t('calibration.cal.std_name')}: <span className="text-kst-blue font-bold">{gageInfo.acceptanceStandard.name}</span>
                </p>
              </div>
            </div>
            {gageInfo.acceptanceStandard.criteria?.length > 0 && (
              <button 
                type="button"
                onClick={() => {
                  const suggestedPoints: any[] = [];
                  if (gageInfo.acceptanceStandard.points && gageInfo.acceptanceStandard.points.length > 0) {
                    gageInfo.acceptanceStandard.points.forEach((pGroup: any) => {
                      const pts = pGroup.points.split(/[,，\s]+/).filter((p: string) => p.trim() !== "");
                      pts.forEach((pt: string) => {
                        const ptNum = parseFloat(pt);
                        // 尋找匹配的判定基準
                        const criterion = gageInfo.acceptanceStandard.criteria.find((c: any) => {
                          const matchesCategory = !c.category || c.category === pGroup.category;
                          const start = c.rangeStart ?? -Infinity;
                          const end = c.rangeEnd ?? Infinity;
                          return matchesCategory && ptNum >= start && ptNum <= end;
                        });

                        suggestedPoints.push({
                          category: pGroup.category,
                          point: pt,
                          lowerLimit: criterion ? (ptNum + criterion.toleranceMinus).toFixed(4) : "",
                          upperLimit: criterion ? (ptNum + criterion.tolerancePlus).toFixed(4) : "",
                          actual: "",
                          error: 0,
                          result: "PASS"
                        });
                      });
                    });
                  } else {
                    // 如果沒有定義點位，才回退到使用基準區間 (維持原本的備援邏輯)
                    gageInfo.acceptanceStandard.criteria.forEach((c: any) => {
                      suggestedPoints.push({
                        category: c.category || "",
                        point: c.rangeStart?.toString() || "0",
                        lowerLimit: (c.rangeStart + c.toleranceMinus).toFixed(4),
                        upperLimit: (c.rangeStart + c.tolerancePlus).toFixed(4),
                        actual: "",
                        error: 0,
                        result: "PASS"
                      });
                    });
                  }
                  setDetails(suggestedPoints);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-kst-blue text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-all shadow-sm"
              >
                <PlusCircle className="w-3.5 h-3.5" /> {t('calibration.cal.apply_points')}
              </button>
            )}
          </div>

          <div className="overflow-hidden rounded-xl border border-blue-100/50 bg-white/50">
            <table className="w-full text-left text-[10px]">
              <thead className="bg-blue-50/50 text-blue-600 font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-2">{t('calibration.cal.std_criteria')}</th>
                  <th className="px-4 py-2">{t('calibration.gage.category')}</th>
                  <th className="px-4 py-2">{t('calibration.cal.lower_limit')}</th>
                  <th className="px-4 py-2">{t('calibration.cal.upper_limit')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-50/50">
                {gageInfo.acceptanceStandard.criteria?.map((c: any, idx: number) => (
                  <tr key={idx} className="text-slate-600">
                    <td className="px-4 py-2 font-mono">
                      {c.rangeStart} ~ {c.rangeEnd || '∞'}
                    </td>
                    <td className="px-4 py-2">{c.category || '-'}</td>
                    <td className="px-4 py-2 text-red-500">{c.toleranceMinus > 0 ? `+${c.toleranceMinus}` : c.toleranceMinus}</td>
                    <td className="px-4 py-2 text-red-500">{c.tolerancePlus > 0 ? `+${c.tolerancePlus}` : c.tolerancePlus}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* 3. Data Entry Table */}
      <CalibrationDataTable 
        details={details}
        acceptanceStandard={gageInfo.acceptanceStandard}
        onChange={handleRowChange}
        onAddRow={addRow}
        onRemoveRow={removeRow}
      />

      </fieldset>

      {/* 4. Notes & Actions */}
      <section className="space-y-4">
        <fieldset disabled={isReadOnly} className="contents">
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700 px-1">{t('quality.vendor.notes')}</label>
            <textarea 
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:bg-white focus:ring-4 focus:ring-kst-blue/5 outline-none transition-all resize-none disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
              placeholder={t('common.common.notes_placeholder')}
            />
          </div>
        </fieldset>

        <div className="flex gap-4 pt-4 border-t border-slate-50">
          <button 
            type="button"
            onClick={onCancel}
            className="flex-1 px-6 py-4 border border-slate-200 rounded-2xl text-sm font-bold text-slate-500 hover:bg-slate-50 transition-colors"
          >
            {isReadOnly ? t('common.common.close') || '關閉' : t('common.common.cancel') || "取消"}
          </button>
          {!isReadOnly && (
            <>
              <button 
                disabled={isSubmitting}
                onClick={(e) => handleFormSubmit(e, 'DRAFT')}
                className="flex-1 px-6 py-4 bg-slate-100 text-slate-600 rounded-2xl text-sm font-bold hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" /> {t('calibration.cal.status_draft')}
              </button>
              <button 
                disabled={isSubmitting}
                onClick={(e) => handleFormSubmit(e, 'PENDING')}
                className="flex-[2] px-6 py-4 bg-kst-blue text-white rounded-2xl text-sm font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-xl shadow-blue-500/20"
              >
                {isSubmitting ? t('calibration.cal.processing') : (
                  <>
                    <Send className="w-5 h-5" /> {t('calibration.cal.submit_review')}
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
