"use client";

import React, { useState } from 'react';
import { 
  ClipboardList, 
  Calendar, 
  AlertTriangle, 
  ChevronRight,
  ArrowRight,
  Package,
  CheckSquare,
  Square,
  Check
} from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import CalibrationModal from "./CalibrationModal";

interface PendingTaskTableProps {
  gages: any[];
  vendors: any[];
}

export default function PendingTaskTable({ gages, vendors }: PendingTaskTableProps) {
  const { t, language } = useLanguage();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const dateLocale = language === 'zh' ? 'zh-TW' : 'en-US';

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === gages.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(gages.map(g => g.id));
    }
  };

  if (gages.length === 0) return null;

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-top-4 duration-700 delay-150">
      <div className="p-6 border-b border-slate-50 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <ClipboardList className="w-5 h-5 text-kst-blue" />
          <h3 className="font-bold text-slate-800">
            {t('calibration.cal.tasks')} {t('common.dash.recent')}
          </h3>
          <span className="bg-kst-blue/10 text-kst-blue px-2 py-0.5 rounded-full text-[10px] font-black tracking-tighter">
            {gages.length}
          </span>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {selectedIds.length > 0 && (
            <Link 
              href={`/gages/batch-calibrate?ids=${selectedIds.join(',')}`}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-xl text-xs font-bold hover:bg-amber-600 transition-all shadow-lg shadow-amber-100"
            >
              <Package className="w-4 h-4" />
              {t('calibration.cal.start_external')} ({selectedIds.length})
            </Link>
          )}
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50/30 text-[#7D7DFF] font-bold text-[11px] uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4 w-10">
                <button 
                  onClick={toggleSelectAll}
                  className="w-5 h-5 flex items-center justify-center rounded border border-slate-300 bg-white hover:border-kst-blue transition-colors"
                >
                  {selectedIds.length === gages.length && gages.length > 0 ? (
                    <CheckSquare className="w-4 h-4 text-kst-blue" />
                  ) : selectedIds.length > 0 ? (
                    <div className="w-2 h-0.5 bg-kst-blue rounded-full" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-200" />
                  )}
                </button>
              </th>
              <th className="px-6 py-4">{t('calibration.gage.id')} / {t('calibration.gage.name')}</th>
              <th className="px-6 py-4">{t('calibration.gage.category')}</th>
              <th className="px-6 py-4">{t('calibration.gage.next_cal')}</th>
              <th className="px-6 py-4 text-center">{t('common.common.status')}</th>
              <th className="px-6 py-4 text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {gages.map((gage) => (
              <tr 
                key={gage.id} 
                className={`group transition-colors ${selectedIds.includes(gage.id) ? 'bg-blue-50/50' : 'hover:bg-slate-50/50'}`}
              >
                <td className="px-6 py-5">
                  <button 
                    onClick={() => toggleSelect(gage.id)}
                    className={`w-5 h-5 flex items-center justify-center rounded border transition-all ${
                      selectedIds.includes(gage.id) 
                        ? 'bg-kst-blue border-kst-blue text-white' 
                        : 'bg-white border-slate-200 group-hover:border-slate-300'
                    }`}
                  >
                    {selectedIds.includes(gage.id) && <Check className="w-3.5 h-3.5" />}
                  </button>
                </td>
                <td className="px-6 py-5">
                  <div className="font-mono font-bold text-kst-blue">{gage.id}</div>
                  <div className="text-xs text-slate-500 font-medium mt-0.5">{gage.name}</div>
                </td>
                <td className="px-6 py-5">
                  <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-[10px] font-bold">
                    {gage.category}
                  </span>
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-2 text-slate-600 font-medium">
                    <Calendar className="w-4 h-4 text-slate-300" />
                    {new Date(gage.nextCalDate).toLocaleDateString(dateLocale)}
                  </div>
                </td>
                <td className="px-6 py-5 text-center">
                  {gage.calculatedStatus === 'OVERDUE' ? (
                    <span className="bg-red-100 text-red-700 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter flex items-center justify-center gap-1 w-fit mx-auto">
                      <AlertTriangle className="w-3 h-3" /> {t('common.status.overdue')}
                    </span>
                  ) : (
                    <span className="bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter flex items-center justify-center gap-1 w-fit mx-auto">
                      <AlertTriangle className="w-3 h-3" /> {t('common.status.warning')}
                    </span>
                  )}
                </td>
                <td className="px-6 py-5 text-right">
                  <div className="flex flex-col items-end gap-2">
                    <CalibrationModal 
                      gageId={gage.id}
                      gageName={gage.name}
                      gageSpec={gage.spec}
                      calPoints={gage.calPoints}
                      acceptance={gage.acceptance}
                      calibrationCycle={gage.calibrationCycle}
                      acceptanceStandard={gage.acceptanceStandard}
                      vendors={vendors}
                    />
                    <Link
                      href={`/gages/batch-calibrate?ids=${gage.id}`}
                      className="flex items-center justify-center gap-1.5 px-4 py-2 bg-amber-500 text-white rounded-xl text-xs font-bold hover:bg-amber-600 transition-all shadow-lg shadow-amber-100 whitespace-nowrap min-w-[110px]"
                      title={t('calibration.cal.start_external_single')}
                    >
                      <Package className="w-3.5 h-3.5" />
                      {t('calibration.cal.start_external_single')}
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
