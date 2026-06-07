"use client";

import { Plus, Trash2 } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface StandardCriteriaEditorProps {
  criteria: any[];
  precisionDecimals?: number;
  onAdd: () => void;
  onRemove: (index: number) => void;
  onChange: (index: number, field: string, value: any) => void;
}

export function StandardCriteriaEditor({
  criteria,
  precisionDecimals,
  onAdd,
  onRemove,
  onChange
}: StandardCriteriaEditorProps) {
  const { t } = useLanguage();

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <label className="text-sm font-bold text-slate-800">{t('calibration.cal.criteria_points')}</label>
        <button 
          type="button"
          onClick={onAdd}
          className="text-xs text-kst-blue font-bold hover:underline flex items-center gap-1"
        >
          <Plus className="w-3.5 h-3.5" /> {t('calibration.cal.add_range')}
        </button>
      </div>

      <div className="space-y-3">
        {criteria.map((c, idx) => (
          <div key={idx} className="flex items-end gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100 group animate-in fade-in slide-in-from-left-2 duration-300">
            <div className="flex-1 grid grid-cols-6 gap-3">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">{t('calibration.cal.item_category')}</span>
                <input 
                  type="text" 
                  value={c.category || ""}
                  onChange={(e) => onChange(idx, 'category', e.target.value)}
                  placeholder={t('calibration.cal.example_od')}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs outline-none"
                />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">{t('calibration.cal.range_start')}</span>
                <input 
                  type="number" 
                  step="0.001"
                  value={c.rangeStart}
                  onChange={(e) => onChange(idx, 'rangeStart', e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs outline-none"
                />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">{t('calibration.cal.range_end')}</span>
                <input 
                  type="number" 
                  step="0.001"
                  value={c.rangeEnd}
                  onChange={(e) => onChange(idx, 'rangeEnd', e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs outline-none"
                />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">{t('calibration.cal.plus_tolerance')}</span>
                <input 
                  type="number" 
                  step="0.001"
                  value={c.tolerancePlus}
                  onChange={(e) => onChange(idx, 'tolerancePlus', e.target.value)}
                  onBlur={(e) => {
                    if (precisionDecimals !== undefined && e.target.value) {
                      const val = parseFloat(e.target.value);
                      if (!isNaN(val)) onChange(idx, 'tolerancePlus', parseFloat(val.toFixed(precisionDecimals)));
                    }
                  }}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs outline-none text-emerald-600 font-bold"
                />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">{t('calibration.cal.minus_tolerance')}</span>
                <input 
                  type="number" 
                  step="0.001"
                  value={c.toleranceMinus}
                  onChange={(e) => onChange(idx, 'toleranceMinus', e.target.value)}
                  onBlur={(e) => {
                    if (precisionDecimals !== undefined && e.target.value) {
                      const val = parseFloat(e.target.value);
                      if (!isNaN(val)) onChange(idx, 'toleranceMinus', parseFloat(val.toFixed(precisionDecimals)));
                    }
                  }}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs outline-none text-red-600 font-bold"
                />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">單位</span>
                <input 
                  type="text" 
                  value={c.unit || ""}
                  onChange={(e) => onChange(idx, 'unit', e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs outline-none"
                />
              </div>
            </div>
            <button 
              type="button"
              onClick={() => onRemove(idx)}
              className="p-2 text-slate-300 hover:text-red-500 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
