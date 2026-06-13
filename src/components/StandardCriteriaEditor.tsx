"use client";

import { Plus, Trash2 } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface StandardCriteriaEditorProps {
  criteria: any[];
  precisionDecimals?: number;
  onAdd: () => void;
  onRemove: (index: number) => void;
  onChange: (index: number, field: string, value: any) => void;
  onBlurCategory?: (index: number, value: string) => void;
}

export function StandardCriteriaEditor({
  criteria,
  precisionDecimals,
  onAdd,
  onRemove,
  onChange,
  onBlurCategory
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

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider">
            <tr>
              <th className="px-3 py-2.5 border-b border-slate-100 w-32">{t('calibration.cal.item_category')}</th>
              <th className="px-3 py-2.5 border-b border-slate-100 w-24">單位</th>
              <th className="px-3 py-2.5 border-b border-slate-100">{t('calibration.cal.range_start')}</th>
              <th className="px-3 py-2.5 border-b border-slate-100">{t('calibration.cal.range_end')}</th>
              <th className="px-3 py-2.5 border-b border-slate-100 text-emerald-600">{t('calibration.cal.plus_tolerance')}</th>
              <th className="px-3 py-2.5 border-b border-slate-100 text-red-500">{t('calibration.cal.minus_tolerance')}</th>
              <th className="px-3 py-2.5 border-b border-slate-100 w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {criteria.map((c, idx) => (
              <tr key={idx} className="group">
                <td className="px-2 py-1.5">
                  <input 
                    type="text" 
                    value={c.category || ""}
                    onChange={(e) => onChange(idx, 'category', e.target.value)}
                    onBlur={(e) => onBlurCategory && onBlurCategory(idx, e.target.value)}
                    placeholder={t('calibration.cal.example_od')}
                    className="w-full px-2 py-1 bg-transparent hover:bg-slate-50 focus:bg-white focus:ring-1 focus:ring-kst-blue outline-none rounded transition-all font-bold text-slate-700"
                  />
                </td>
                <td className="px-2 py-1.5">
                  <input 
                    type="text" 
                    value={c.unit || ""}
                    onChange={(e) => onChange(idx, 'unit', e.target.value)}
                    placeholder="mm"
                    className="w-full px-2 py-1 bg-transparent hover:bg-slate-50 focus:bg-white focus:ring-1 focus:ring-kst-blue outline-none rounded transition-all text-slate-600"
                  />
                </td>
                <td className="px-2 py-1.5">
                  <input 
                    type="number" 
                    step="0.001"
                    value={c.rangeStart}
                    onChange={(e) => onChange(idx, 'rangeStart', e.target.value)}
                    className="w-full px-2 py-1 bg-transparent hover:bg-slate-50 focus:bg-white focus:ring-1 focus:ring-kst-blue outline-none rounded transition-all font-mono text-slate-600"
                  />
                </td>
                <td className="px-2 py-1.5">
                  <input 
                    type="number" 
                    step="0.001"
                    value={c.rangeEnd}
                    onChange={(e) => onChange(idx, 'rangeEnd', e.target.value)}
                    className="w-full px-2 py-1 bg-transparent hover:bg-slate-50 focus:bg-white focus:ring-1 focus:ring-kst-blue outline-none rounded transition-all font-mono text-slate-600"
                  />
                </td>
                <td className="px-2 py-1.5">
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
                    className="w-full px-2 py-1 bg-transparent hover:bg-emerald-50 focus:bg-white focus:ring-1 focus:ring-emerald-500 outline-none rounded transition-all text-emerald-600 font-bold font-mono"
                  />
                </td>
                <td className="px-2 py-1.5">
                  <input 
                    type="number" 
                    step="0.001"
                    value={c.toleranceMinus === "" || c.toleranceMinus === "-" ? "" : Math.abs(parseFloat(c.toleranceMinus) || 0)}
                    onChange={(e) => onChange(idx, 'toleranceMinus', e.target.value)}
                    onBlur={(e) => {
                      if (precisionDecimals !== undefined && e.target.value) {
                        const val = parseFloat(e.target.value);
                        if (!isNaN(val)) onChange(idx, 'toleranceMinus', Math.abs(parseFloat(val.toFixed(precisionDecimals))));
                      }
                    }}
                    className="w-full px-2 py-1 bg-transparent hover:bg-red-50 focus:bg-white focus:ring-1 focus:ring-red-500 outline-none rounded transition-all text-red-600 font-bold font-mono"
                  />
                </td>
                <td className="px-2 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    type="button"
                    onClick={() => onRemove(idx)}
                    className="p-1 text-slate-300 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
