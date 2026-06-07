import React from 'react';
import { Database, FileSpreadsheet, Download, Upload, Info } from 'lucide-react';
import { getTranslation } from '@/lib/i18n/server-translations';
import { CSVControls } from "@/components/CSVControls";
import { HistoryControls } from "@/components/HistoryControls";

export default async function DataManagementPage() {
  const { t } = await getTranslation();

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <header>
        <div className="flex items-center gap-3">
          <Database className="w-8 h-8 text-kst-blue" />
          <h1 className="text-3xl font-bold text-slate-800">{t('common.dash.data_management')}</h1>
        </div>
        <p className="text-slate-500 mt-2">{t('common.dash.data_mgmt_desc')}</p>
      </header>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Instrument Master Section */}
        <section className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-50 bg-slate-50/50">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <FileSpreadsheet className="w-6 h-6 text-kst-blue" />
              {t('calibration.gage.list')}
            </h2>
          </div>
          <div className="p-8 flex-1 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="p-4 bg-blue-50/50 rounded-2xl flex items-start gap-3">
                <Info className="w-5 h-5 text-kst-blue shrink-0 mt-0.5" />
                <p className="text-sm text-slate-600 leading-relaxed">
                  {t('common.dash.equipment_list_desc')}
                </p>
              </div>
            </div>
            <div className="pt-4 border-t border-slate-50 flex justify-center">
              <CSVControls />
            </div>
          </div>
        </section>

        {/* Calibration History Section */}
        <section className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-50 bg-slate-50/50">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <FileSpreadsheet className="w-6 h-6 text-emerald-500" />
              {t('common.dash.history_reports')}
            </h2>
          </div>
          <div className="p-8 flex-1 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50/50 rounded-2xl flex items-start gap-3">
                <Info className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <p className="text-sm text-slate-600 leading-relaxed">
                  {t('common.dash.history_reports_desc')}
                </p>
              </div>
            </div>
            <div className="pt-4 border-t border-slate-50 flex justify-center">
              <HistoryControls />
            </div>
          </div>
        </section>
      </div>

      {/* Format Tips */}
      <footer className="bg-slate-50 rounded-3xl p-8 border border-slate-100">
        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Info className="w-5 h-5 text-slate-400" />
          {t('common.dash.format_tips')}
        </h3>
        <ul className="text-sm text-slate-500 space-y-3 list-disc pl-5">
          <li>{t('common.dash.supported_formats')} <strong>.xlsx</strong>, .xls, .csv</li>
          <li>{t('common.dash.template_hint')}</li>
          <li>{t('common.dash.date_format_hint')} <code>YYYY/MM/DD</code> (如 2024/05/20)。</li>
          <li>{t('common.dash.overwrite_hint')}</li>
        </ul>
      </footer>
    </div>
  );
}
