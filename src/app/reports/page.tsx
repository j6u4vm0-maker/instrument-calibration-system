import React from 'react';
import { GageService } from "@/services/gage-service";
import { CalibrationService } from "@/services/calibration-service";
import { BatchService } from "@/services/batch-service";
import { 
  FileSearch,
  Clock,
  Package,
  ChevronRight,
  History,
  CheckCircle2,
  ShieldCheck,
  ClipboardList
} from "lucide-react";
import RecordTable from "@/components/RecordTable";
import Link from "next/link";
import { getTranslation } from '@/lib/i18n/server-translations';

export default async function ReportsPage() {
  const { t, language } = await getTranslation();
  const records = await CalibrationService.getAllRecords();
  const allGages = await GageService.getBasicGages();
  const vendors = await BatchService.getAllVendors();
  const reportsToReview = records.filter(r => r.status === 'PENDING');
  const draftRecords = records.filter(r => r.status === 'DRAFT');
  const historyRecords = records.filter(r => r.status !== 'DRAFT' && r.status !== 'PENDING');

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-12">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
            <FileSearch className="w-8 h-8 text-kst-blue" />
            {t('calibration.cal.mgmt_center')}
          </h1>
          <p className="text-slate-500 mt-2 font-medium">
            {t('calibration.cal.center_desc')}
          </p>
        </div>
      </header>

      {/* 待審核報告專區 */}
      {reportsToReview.length > 0 && (
        <section className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-emerald-500" />
              {t('calibration.cal.review_list')} ({reportsToReview.length})
            </h2>
          </div>
          <div className="bg-emerald-50/30 border border-emerald-100 rounded-3xl p-2 overflow-hidden">
            <RecordTable records={reportsToReview} gages={allGages} vendors={vendors} />
          </div>
        </section>
      )}

      {/* 草稿報告專區 */}
      {draftRecords.length > 0 && (
        <section className="space-y-6 pt-6 border-t border-slate-100">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <ClipboardList className="w-6 h-6 text-slate-500" />
              未完成草稿 ({draftRecords.length})
            </h2>
          </div>
          <div className="bg-slate-50/80 border border-slate-200 rounded-3xl p-2 overflow-hidden">
            <RecordTable records={draftRecords} gages={allGages} vendors={vendors} />
          </div>
        </section>
      )}

      {/* 2. 歷史報告查詢與管理 */}
      <section className="space-y-6 pt-6 border-t border-slate-100">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <History className="w-6 h-6 text-kst-blue" />
            {t('common.dash.history_reports')}
          </h2>
          <div className="text-sm font-medium text-slate-400">
            {historyRecords.length} {t('calibration.cal.total_records')}
          </div>
        </div>
        <RecordTable records={historyRecords} gages={allGages} vendors={vendors} />
      </section>
    </div>
  );
}
