"use client";

import { useState } from "react";
import { ClipboardList } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { MasterGageSelector } from "./MasterGageSelector";
import { CalibrationDataTable } from "./CalibrationDataTable";
import { useCalibrationForm } from "@/hooks/useCalibrationForm";
import { CalibrationActionButtons } from "./CalibrationActionButtons";

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
  
  const {
    calDate, setCalDate,
    inspector, setInspector,
    notes, setNotes,
    temperature,
    humidity,
    selectedMasterIds, setSelectedMasterIds,
    details,
    handleRowChange, addRow, removeRow
  } = useCalibrationForm({ gageInfo, initialData });

  const [isMasterModalOpen, setIsMasterModalOpen] = useState(false);

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
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-kst-blue outline-none disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                placeholder={t('calibration.cal.inspector_placeholder')}
              />
            </div>
          </div>
        </div>

        <div className="md:col-span-1 space-y-4">
          <div className="bg-emerald-50/50 p-6 rounded-2xl border border-emerald-100 h-full flex flex-col justify-center">
            <div className="flex items-center justify-between mb-4">
              <div className="space-y-1">
                <h4 className="font-bold text-emerald-800">{t('calibration.cal.traceability')}</h4>
                <p className="text-xs text-emerald-600 font-medium">{t('calibration.cal.internal_standard')}</p>
              </div>
              <button
                type="button"
                disabled={isReadOnly}
                onClick={() => setIsMasterModalOpen(true)}
                className="px-3 py-1.5 bg-emerald-500 text-white text-xs font-bold rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-50"
              >
                + {t('calibration.cal.add_standard')}
              </button>
            </div>
            {selectedMasterIds.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {selectedMasterIds.map(id => (
                  <span key={id} className="px-2 py-1 bg-white border border-emerald-200 text-emerald-700 text-xs font-bold rounded-md">
                    {id}
                  </span>
                ))}
              </div>
            ) : (
              <div className="p-4 border border-dashed border-emerald-200 rounded-xl text-center">
                <p className="text-xs text-emerald-400 font-medium">{t('calibration.cal.no_standard_selected')}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 2. Acceptance Standard Specs (Read Only) */}
      {gageInfo.acceptanceStandard && (
        <section className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h4 className="font-bold text-slate-800 text-sm">{t('calibration.cal.acceptance_standard')}</h4>
              <p className="text-xs text-slate-500 mt-1">{gageInfo.acceptanceStandard.name}</p>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center px-2 py-1 rounded-md bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-100 uppercase">
                {t('calibration.cal.version')}: {gageInfo.acceptanceStandard.version || '1.0'}
              </span>
            </div>
          </div>
          
          <div className="overflow-x-auto">
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
                    <td className="px-4 py-2 text-red-500">-{Math.abs(c.toleranceMinus)}</td>
                    <td className="px-4 py-2 text-red-500">+{Math.abs(c.tolerancePlus)}</td>
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

        <CalibrationActionButtons
          isReadOnly={isReadOnly}
          isSubmitting={isSubmitting}
          onCancel={onCancel}
          onSubmit={handleFormSubmit}
        />
      </section>
    </div>
  );
}
