"use client";

import { CheckCircle2, XCircle, Trash2, PlusCircle } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface CalibrationDataTableProps {
  details: any[];
  acceptanceStandard?: any;
  precisionDecimals?: number;
  onChange: (index: number, field: string, value: any) => void;
  onAddRow: () => void;
  onRemoveRow: (index: number) => void;
}

export function CalibrationDataTable({
  details,
  acceptanceStandard,
  precisionDecimals,
  onChange,
  onAddRow,
  onRemoveRow
}: CalibrationDataTableProps) {
  const { t } = useLanguage();

  return (
    <section className="space-y-4">
      <div className="flex justify-between items-center px-1">
        <h4 className="font-bold text-slate-800 flex items-center gap-2">
          <PlusCircle className="w-5 h-5 text-kst-blue" />
          {t('calibration.cal.cal_data_entry')}
        </h4>
        <button 
          type="button"
          onClick={onAddRow}
          className="text-xs font-bold text-kst-blue hover:underline"
        >
          + {t('calibration.cal.add_item')}
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50/80 text-[10px] font-bold text-[#7D7DFF] uppercase tracking-widest">
            <tr>
              <th className="px-4 py-3">{t('calibration.gage.category')}</th>
              <th className="px-4 py-3">{t('calibration.cal.spec_value')}</th>
              <th className="px-4 py-3">{t('calibration.cal.lower_limit')}</th>
              <th className="px-4 py-3">{t('calibration.cal.upper_limit')}</th>
              <th className="px-4 py-3">{t('calibration.cal.actual_value')}</th>
              <th className="px-4 py-3 text-center">{t('calibration.cal.error_value')}</th>
              <th className="px-4 py-3 text-center w-16">{t('common.common.status')}</th>
              <th className="px-4 py-3 w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {details.map((d, i) => (
              <tr key={i} className="group hover:bg-blue-50/30 transition-colors">
                <td className="px-4 py-3">
                  <input 
                    type="text" 
                    value={d.category || ""}
                    onChange={(e) => onChange(i, 'category', e.target.value)}
                    className="w-full bg-transparent border-none focus:ring-0 text-sm font-medium text-slate-600 outline-none disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                    placeholder={t('calibration.cal.category_placeholder')}
                  />
                </td>
                <td className="px-4 py-3">
                  <input 
                    required
                    type="text" 
                    value={d.point || ""}
                    onChange={(e) => onChange(i, 'point', e.target.value)}
                    className="w-full bg-transparent border-none focus:ring-0 text-sm font-mono font-bold text-slate-800 outline-none disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                    placeholder="0.00"
                  />
                </td>
                <td className="px-4 py-3">
                  <input 
                    type="text" 
                    value={d.lowerLimit || ""}
                    onChange={(e) => onChange(i, 'lowerLimit', e.target.value)}
                    className="w-full bg-transparent border-none focus:ring-0 text-xs font-mono text-red-500 outline-none disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                  />
                </td>
                <td className="px-4 py-3">
                  <input 
                    type="text" 
                    value={d.upperLimit || ""}
                    onChange={(e) => onChange(i, 'upperLimit', e.target.value)}
                    className="w-full bg-transparent border-none focus:ring-0 text-xs font-mono text-red-500 outline-none disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                  />
                </td>
                <td className="px-4 py-3">
                  <div className="relative">
                    <input 
                      required
                      type="number" 
                      step="any"
                      value={d.actual ?? ""}
                      onChange={(e) => onChange(i, 'actual', e.target.value)}
                      onBlur={(e) => {
                        if (precisionDecimals !== undefined && e.target.value) {
                          const val = parseFloat(e.target.value);
                          if (!isNaN(val)) {
                            onChange(i, 'actual', val.toFixed(precisionDecimals));
                          }
                        }
                      }}
                      className="w-full px-3 py-1.5 bg-blue-50/50 border border-transparent rounded-lg text-sm font-mono font-bold text-kst-blue focus:bg-white focus:border-kst-blue/30 focus:ring-4 focus:ring-kst-blue/5 outline-none transition-all disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                    />
                  </div>
                </td>
                <td className="px-4 py-3 text-center text-xs font-mono font-medium text-slate-400">
                  {d.error > 0 ? `+${d.error}` : d.error}
                </td>
                <td className="px-4 py-3 text-center">
                  {d.result === 'PASS' ? (
                    <div className="inline-flex p-1 bg-emerald-100 text-emerald-600 rounded-full">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                  ) : (
                    <div className="inline-flex p-1 bg-red-100 text-red-600 rounded-full">
                      <XCircle className="w-3.5 h-3.5" />
                    </div>
                  )}
                </td>
                <td className="px-4 py-3">
                  <button 
                    type="button"
                    onClick={() => onRemoveRow(i)}
                    className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
