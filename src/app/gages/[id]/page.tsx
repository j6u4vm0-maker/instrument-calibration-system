import { getTranslation } from '@/lib/i18n/server-translations';
import { GageService } from "@/services/gage-service";
import { VendorService } from "@/services/vendor-service";
import { notFound } from "next/navigation";
import Link from "next/link";
import { 
  ChevronLeft, 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  MapPin, 
  Calendar, 
  History, 
  XCircle 
} from "lucide-react";
import GageEditModal from "@/components/GageEditModal";
import CalibrationModal from "@/components/CalibrationModal";
import { CriteriaTable, PointsTable } from "@/components/GageDataTables";
import HistoryRecordList from "@/components/HistoryRecordList";

export default async function GageDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { t, language } = await getTranslation();
  const { id } = await params;
  const decodedId = decodeURIComponent(id);
  const gage = await GageService.getGageById(decodedId);
  const vendors = await VendorService.getAllVendors();
  const lastCalInfo = await VendorService.getLastCalibrationInfo(decodedId);

  const dateLocale = language === 'zh' ? 'zh-TW' : 'en-US';

  if (!gage) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8 pb-24">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Breadcrumbs & Navigation */}
        <nav className="flex items-center gap-2 text-sm text-slate-400 mb-2">
          <Link href="/gages" className="hover:text-kst-blue transition-colors">{t('calibration.gage.list')}</Link>
          <span>/</span>
          <span className="text-slate-600 font-medium">{gage.id}</span>
        </nav>

        {/* Enhanced Header */}
        <header className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-5">
            <Link href="/gages" className="p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-all text-slate-500 group">
              <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
            </Link>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-3xl font-black text-slate-800 tracking-tight">{gage.id}</h1>
                {gage.calculatedStatus === 'PASS' && (
                  <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 border border-emerald-100">
                     <CheckCircle2 className="w-3 h-3" /> {t('common.status.pass')}
                  </span>
                )}
                {gage.calculatedStatus === 'WARNING' && (
                  <span className="bg-amber-50 text-amber-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 border border-amber-100">
                    <AlertTriangle className="w-3 h-3" /> {t('common.status.warning')}
                  </span>
                )}
                {gage.calculatedStatus === 'OVERDUE' && (
                  <span className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 border border-red-100">
                    <AlertTriangle className="w-3 h-3" /> {t('common.status.overdue')}
                  </span>
                )}
              </div>
              <p className="text-slate-500 font-bold flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-kst-blue/40" />
                {gage.name}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <GageEditModal gage={gage} />
            <div className="h-10 w-px bg-slate-100 mx-1 hidden md:block" />
            <CalibrationModal 
              gageId={gage.id} 
              gageName={gage.name}
              gageSpec={gage.spec || ''}
              calPoints={gage.calPoints} 
              acceptance={gage.acceptance} 
              calibrationCycle={gage.calibrationCycle}
              acceptanceStandard={gage.acceptanceStandard}
              vendors={vendors}
              lastCalInfo={lastCalInfo}
              isCalibrating={(gage as any).isCalibrating}
            />
          </div>
        </header>

        <div className="flex flex-col gap-8">
          {/* Top Section: Details & Schedule */}
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
            <div className="xl:col-span-3 space-y-8">
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-50 bg-slate-50/30 flex justify-between items-center">
                  <h3 className="font-black text-slate-800 text-sm flex items-center gap-2.5 uppercase tracking-widest">
                    <Info className="w-4 h-4 text-kst-blue" /> {t('calibration.gage.details')}
                  </h3>
                </div>
                
                <div className="p-8">
                  {/* Basic Info Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
                    {[
                      { label: t('calibration.gage.category'), value: gage.category },
                      { 
                        label: t('calibration.gage.location'), 
                        value: (
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-slate-300" />
                            {((gage as any).locationRef?.name) || t('common.common.unassigned')} / {((gage as any).departmentRef?.name) || ''}
                          </div>
                        )
                      },
                      { 
                        label: t('calibration.gage.custodian'), 
                        value: (gage as any).custodianRef ? (
                          <div className="flex flex-col gap-0.5">
                            <span className="text-slate-800 font-black">{(gage as any).custodianRef.name}</span>
                            <span className="text-[10px] text-slate-400 font-bold uppercase leading-none">
                              {((gage as any).locationRef?.name) || ''} / {((gage as any).departmentRef?.name) || ''}
                            </span>
                          </div>
                        ) : (gage.manager || '-')
                      },
                      { label: t('calibration.gage.cycle'), value: t('calibration.gage.cycle_months', { months: gage.calibrationCycle }) },
                      { label: t('calibration.gage.precision'), value: gage.precision || '-' },
                    ].map((item, idx) => (
                      <div key={idx} className="group">
                        <label className="text-[10px] text-slate-400 uppercase tracking-widest font-black mb-1.5 block group-hover:text-kst-blue transition-colors">
                          {item.label}
                        </label>
                        <div className="text-sm text-slate-700 font-bold">
                          {item.value || '-'}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Spec & Notes Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
                    <div className="group">
                      <label className="text-[10px] text-slate-400 uppercase tracking-widest font-black mb-1.5 block group-hover:text-kst-blue transition-colors">
                        {t('calibration.gage.spec')}
                      </label>
                      <div className="text-sm text-slate-700 font-bold whitespace-pre-wrap bg-slate-50/50 p-4 rounded-2xl border border-slate-100 min-h-[60px]">
                        {gage.spec || '-'}
                      </div>
                    </div>
                    <div className="group">
                      <label className="text-[10px] text-slate-400 uppercase tracking-widest font-black mb-1.5 block group-hover:text-kst-blue transition-colors">
                        {t('common.common.notes')}
                      </label>
                      <div className="text-sm text-slate-700 font-bold whitespace-pre-wrap bg-slate-50/50 p-4 rounded-2xl border border-slate-100 min-h-[60px]">
                        {gage.notes || '-'}
                      </div>
                    </div>
                  </div>

                  {/* Tables Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="group">
                      <label className="text-[10px] text-slate-400 uppercase tracking-widest font-black mb-3 block group-hover:text-kst-blue transition-colors">
                        {t('calibration.gage.acceptance')}
                      </label>
                      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                        <CriteriaTable text={gage.acceptance} />
                      </div>
                    </div>
                    <div className="group">
                      <label className="text-[10px] text-slate-400 uppercase tracking-widest font-black mb-3 block group-hover:text-kst-blue transition-colors">
                        {t('calibration.gage.points')}
                      </label>
                      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                        <PointsTable text={gage.calPoints} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Schedule & Metadata Sidebar (in Top Row) */}
            <div className="space-y-8">
              {/* Schedule Card */}
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6 relative overflow-hidden group h-full">
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
                  <Calendar className="w-24 h-24 text-kst-blue" />
                </div>
                <h3 className="font-black text-slate-800 text-sm flex items-center gap-2.5 uppercase tracking-widest border-b border-slate-50 pb-4">
                  <Calendar className="w-4 h-4 text-kst-blue" /> {t('calibration.cal.schedule')}
                </h3>
                <div className="flex flex-col gap-4">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-black uppercase block mb-1">{t('calibration.gage.last_cal')}</span>
                    <span className="text-sm font-black text-slate-700">
                      {new Date(gage.lastCalDate).toLocaleDateString(dateLocale)}
                    </span>
                  </div>
                  <div className={`p-4 rounded-2xl border ${gage.calculatedStatus === 'OVERDUE' ? 'bg-red-50 border-red-100' : 'bg-blue-50 border-blue-100'}`}>
                    <span className="text-[10px] font-black uppercase block mb-1 opacity-60">{t('calibration.gage.next_cal')}</span>
                    <span className={`text-sm font-black ${gage.calculatedStatus === 'OVERDUE' ? 'text-red-600' : 'text-kst-blue'}`}>
                      {new Date(gage.nextCalDate).toLocaleDateString(dateLocale)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Section: History */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden min-h-[500px] flex flex-col">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/10">
              <div>
                <h3 className="font-black text-slate-800 text-lg flex items-center gap-3">
                  <History className="w-6 h-6 text-kst-blue" /> {t('calibration.cal.history')}
                </h3>
                <p className="text-xs text-slate-400 mt-1 font-bold">{t('calibration.cal.history_subtitle', { count: gage.records.length })}</p>
              </div>
            </div>
            
            <HistoryRecordList 
              records={gage.records} 
              gage={gage} 
              vendors={vendors} 
              dateLocale={dateLocale} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}
