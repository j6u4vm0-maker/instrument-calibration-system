import React from 'react';
import { GageService } from "@/services/gage-service";
import { 
  ClipboardList, 
  History, 
  ChevronRight,
  Calendar,
  Building2,
  Tag,
  CheckCircle2,
  Clock
} from "lucide-react";
import Link from "next/link";
import { getTranslation } from '@/lib/i18n/server-translations';

export default async function BatchesPage() {
  const { t } = await getTranslation();
  const batches = await GageService.getAllBatches();

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
            <History className="w-8 h-8 text-kst-blue" />
            {t('calibration.cal.batch_records_title')}
          </h1>
          <p className="text-slate-500 mt-2">
            {t('calibration.cal.batch_records_desc')}
          </p>
        </div>
      </header>

      <div className="grid gap-4">
        {batches.length > 0 ? (
          batches.map((batch) => (
            <div 
              key={batch.id} 
              className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 hover:shadow-md transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
            >
              <div className="flex gap-4 items-start">
                <div className={`p-3 rounded-xl ${batch.status === 'DRAFT' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
                  {batch.status === 'DRAFT' ? <Clock className="w-6 h-6" /> : <CheckCircle2 className="w-6 h-6" />}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-lg text-slate-800">
                      {batch.invoiceNo || t('calibration.cal.no_invoice_no')}
                    </h3>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      batch.status === 'DRAFT' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {batch.status === 'DRAFT' ? t('calibration.cal.in_progress') : t('calibration.cal.completed')}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-500 font-medium">
                    <div className="flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-slate-300" />
                      {batch.vendor.name}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Tag className="w-4 h-4 text-slate-300" />
                      {batch._count.records} {t('calibration.cal.total_devices')}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-slate-300" />
                      {new Date(batch.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto">
                <Link 
                  href={`/batches/${batch.id}`}
                  className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                    batch.status === 'DRAFT' 
                      ? 'bg-kst-blue text-white shadow-lg shadow-blue-500/20 hover:bg-blue-700' 
                      : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {batch.status === 'DRAFT' ? t('calibration.cal.fill_results') : t('common.common.details')}
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-20 text-center text-slate-400">
            <ClipboardList className="w-12 h-12 mx-auto mb-4 opacity-20" />
            {t('calibration.cal.no_batch_records')}
          </div>
        )}
      </div>
    </div>
  );
}
