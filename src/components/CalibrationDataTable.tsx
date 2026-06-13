"use client";

import React from "react";
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
    <section className="space-y-3">
      <div className="flex justify-between items-center px-1">
        <h4 className="font-bold text-slate-800 flex items-center gap-2">
          <PlusCircle className="w-5 h-5 text-kst-blue" />
          {t('calibration.cal.cal_data_entry')}
        </h4>
        <button 
          type="button"
          onClick={onAddRow}
          className="text-xs font-bold text-kst-blue hover:underline px-2 py-1 rounded-md hover:bg-blue-50 transition-colors"
        >
          + {t('calibration.cal.add_item')}
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-100 text-[11px] font-bold text-slate-700 uppercase tracking-wider border-b border-slate-200">
            <tr>
              <th className="px-3 py-2.5">{t('calibration.gage.category')}</th>
              <th className="px-3 py-2.5 text-right">{t('calibration.cal.spec_value')}</th>
              <th className="px-3 py-2.5 text-right">{t('calibration.cal.lower_limit')}</th>
              <th className="px-3 py-2.5 text-right">{t('calibration.cal.upper_limit')}</th>
              <th className="px-3 py-2.5 text-right">{t('calibration.cal.actual_value')}</th>
              <th className="px-3 py-2.5 text-right">{t('calibration.cal.error_value')}</th>
              <th className="px-3 py-2.5 text-center w-24">{t('common.common.status')}</th>
              <th className="px-3 py-2.5 w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {details.map((d, i) => {
              const isPass = d.result === 'PASS';
              const isFail = d.result === 'FAIL';
              
              const prevCategory = i > 0 ? details[i-1].category : null;
              const isNewGroup = d.category !== prevCategory;

              return (
                <React.Fragment key={i}>
                  {isNewGroup && (
                    <tr className="bg-slate-100 border-y border-slate-200">
                      <td colSpan={8} className="px-3 py-1.5 font-bold text-slate-800 text-xs flex items-center gap-2">
                        <div className="w-1.5 h-4 bg-kst-blue rounded-full"></div>
                        {d.category || t('cal.uncategorized') || '未分類'}
                      </td>
                    </tr>
                  )}
                  <tr className="group hover:bg-slate-50 transition-colors">
                    <td className="px-3 py-2 w-48">
                    <input 
                      type="text" 
                      value={d.category || ""}
                      onChange={(e) => onChange(i, 'category', e.target.value)}
                      className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-md focus:border-kst-blue focus:ring-2 focus:ring-kst-blue/20 text-sm font-medium text-slate-700 outline-none transition-all disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed placeholder:text-slate-300"
                      placeholder={t('calibration.cal.category_placeholder')}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input 
                      required
                      type="text" 
                      value={d.point || ""}
                      onChange={(e) => onChange(i, 'point', e.target.value)}
                      className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-md focus:border-kst-blue focus:ring-2 focus:ring-kst-blue/20 text-sm font-mono font-bold text-slate-800 text-right outline-none transition-all disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed placeholder:text-slate-300"
                      placeholder="0.00"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input 
                      type="text" 
                      value={d.lowerLimit || ""}
                      onChange={(e) => onChange(i, 'lowerLimit', e.target.value)}
                      className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-md focus:border-kst-blue focus:ring-2 focus:ring-kst-blue/20 text-xs font-mono text-slate-600 text-right outline-none transition-all disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input 
                      type="text" 
                      value={d.upperLimit || ""}
                      onChange={(e) => onChange(i, 'upperLimit', e.target.value)}
                      className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-md focus:border-kst-blue focus:ring-2 focus:ring-kst-blue/20 text-xs font-mono text-slate-600 text-right outline-none transition-all disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed"
                    />
                  </td>
                  <td className="px-3 py-2 w-40">
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
                        className={`w-full px-2 py-1.5 border rounded-md text-sm font-mono font-bold text-right outline-none transition-all disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed ${
                          isPass 
                            ? 'bg-emerald-50/50 border-emerald-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-emerald-700' 
                            : isFail
                            ? 'bg-red-50/50 border-red-200 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 text-red-700'
                            : 'bg-white border-slate-200 focus:border-kst-blue focus:ring-2 focus:ring-kst-blue/20 text-slate-800'
                        }`}
                      />
                    </div>
                  </td>
                  <td className={`px-3 py-2 text-right text-sm font-mono font-bold ${
                    isPass ? 'text-emerald-600' : isFail ? 'text-red-600' : 'text-slate-400'
                  }`}>
                    {d.error > 0 ? `+${d.error}` : d.error}
                  </td>
                  <td className="px-3 py-2 text-center">
                    {isPass ? (
                      <div className="inline-flex items-center justify-center gap-1 px-2 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-md text-[10px] font-bold tracking-wider">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>PASS</span>
                      </div>
                    ) : isFail ? (
                      <div className="inline-flex items-center justify-center gap-1 px-2 py-0.5 bg-red-50 border border-red-200 text-red-600 rounded-md text-[10px] font-bold tracking-wider">
                        <XCircle className="w-3 h-3" />
                        <span>FAIL</span>
                      </div>
                    ) : (
                      <div className="inline-flex items-center justify-center gap-1 px-2 py-0.5 bg-slate-50 border border-slate-200 text-slate-400 rounded-md text-[10px] font-bold tracking-wider">
                        <span className="w-3 h-3 flex items-center justify-center">-</span>
                        <span>WAIT</span>
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <button 
                      type="button"
                      onClick={() => onRemoveRow(i)}
                      className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

