import React from 'react';
import { GageService } from "@/services/gage-service";
import { 
  Clock, 
  AlertCircle, 
  ChevronRight,
  Calendar,
  MapPin
} from "lucide-react";
import Link from "next/link";
import { getTranslation } from '@/lib/i18n/server-translations';
import CalibrationModal from "@/components/CalibrationModal";
import { differenceInDays } from 'date-fns';

export default async function PendingCalibrationsPage() {
  const { t, language } = await getTranslation();
  const activeReminders = await GageService.getActiveReminders();
  
  const pendingGages = activeReminders
    .map(r => r.gage)
    .sort((a, b) => new Date(a.nextCalDate).getTime() - new Date(b.nextCalDate).getTime());

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
          <Clock className="w-8 h-8 text-amber-500" />
          {t('pending_calibrations')}
        </h1>
        <p className="text-slate-500 mt-2">
          {t('upcoming_calibrations')} & {t('overdue_instruments')}
        </p>
      </header>

      <div className="grid gap-4">
        {pendingGages.length > 0 ? (
          pendingGages.map((gage) => {
            const daysLeft = differenceInDays(new Date(gage.nextCalDate), new Date());
            const isOverdue = daysLeft < 0;

            return (
              <div 
                key={gage.id} 
                className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 hover:shadow-md transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
              >
                <div className="flex gap-4 items-start">
                  <div className={`p-3 rounded-xl ${isOverdue ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}`}>
                    {isOverdue ? <AlertCircle className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="font-bold text-lg text-slate-800">{gage.name}</h3>
                      <span className="text-xs font-mono bg-slate-100 px-2 py-1 rounded text-slate-500 uppercase tracking-wider">{gage.id}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-2 text-sm text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-slate-300" />
                        {t('next_cal_date')}: {new Date(gage.nextCalDate).toLocaleDateString(language === 'zh' ? 'zh-TW' : 'en-US')}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-slate-300" />
                        {gage.location}
                      </div>
                      <div className={`font-bold ${isOverdue ? 'text-red-500' : 'text-amber-500'}`}>
                        {isOverdue ? t('overdue') : `${t('days_remaining')}: ${daysLeft}`}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                  <Link 
                    href={`/gages/${encodeURIComponent(gage.id)}`}
                    className="flex-1 md:flex-none px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm font-bold hover:bg-slate-50 transition-colors text-center"
                  >
                    {t('details')}
                  </Link>
                  <CalibrationModal 
                    gageId={gage.id} 
                    calPoints={gage.calPoints} 
                    acceptance={gage.acceptance} 
                  />
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-20 text-center text-slate-400">
            {t('no_data')}
          </div>
        )}
      </div>
    </div>
  );
}
