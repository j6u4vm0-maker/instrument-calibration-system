"use client";

import { useState } from "react";
import { CheckCircle2, XCircle, History, Eye, Edit3 } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import CalibrationModal from "./CalibrationModal";

interface HistoryRecordListProps {
  records: any[];
  gage: any;
  vendors: any[];
  dateLocale: string;
}

export default function HistoryRecordList({ records, gage, vendors, dateLocale }: HistoryRecordListProps) {
  const { t } = useLanguage();
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleRowClick = (record: any) => {
    setSelectedRecord(record);
    setIsModalOpen(true);
  };

  return (
    <>
      <div className="flex-1 overflow-x-auto">
        <table className="w-full text-left text-sm border-separate border-spacing-0">
          <thead>
            <tr className="bg-slate-50/50">
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">{t('calibration.cal.report_date')}</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">{t('calibration.cal.result')}</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">{t('calibration.cal.cert_no')}</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">{t('calibration.cal.inspector')}</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">{t('common.common.actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {records.length > 0 ? (
              records.map((record) => (
                <tr 
                  key={record.id} 
                  onClick={() => handleRowClick(record)}
                  className="hover:bg-blue-50/50 transition-all group cursor-pointer"
                >
                  <td className="px-8 py-6">
                    <div className="text-slate-800 font-black">
                      {new Date(record.calDate).toLocaleDateString(dateLocale)}
                    </div>
                    {record.notes && (
                      <div className="text-[10px] text-slate-400 mt-1 font-bold italic line-clamp-1 group-hover:line-clamp-none transition-all">
                        {record.notes}
                      </div>
                    )}
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col gap-1.5 items-start">
                      {record.status === 'DRAFT' && (
                        <span className="inline-flex items-center gap-1.5 text-slate-500 font-black px-2 py-0.5 bg-slate-100 rounded text-[10px] uppercase tracking-widest border border-slate-200">
                          {t('calibration.cal.status_draft') || 'DRAFT'}
                        </span>
                      )}
                      {record.status === 'PENDING' && (
                        <span className="inline-flex items-center gap-1.5 text-amber-600 font-black px-2 py-0.5 bg-amber-50 rounded text-[10px] uppercase tracking-widest border border-amber-100">
                          {t('calibration.cal.status_pending') || 'PENDING (REVIEW)'}
                        </span>
                      )}
                      {record.result === 'PASS' ? (
                        <span className="inline-flex items-center gap-1.5 text-emerald-600 font-black px-3 py-1 bg-emerald-50 rounded-full text-xs border border-emerald-100/50">
                          <CheckCircle2 className="w-3.5 h-3.5" /> {t('common.status.pass')}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-red-600 font-black px-3 py-1 bg-red-50 rounded-full text-xs border border-red-100/50">
                          <XCircle className="w-3.5 h-3.5" /> {t('calibration.cal.fail')}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-slate-500 font-mono text-xs font-bold">
                    {record.certificateNo || '-'}
                  </td>
                  <td className="px-8 py-6 text-slate-600 font-bold">
                    {record.inspector}
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button className="p-2 text-slate-300 group-hover:text-kst-blue transition-colors">
                      {record.status === 'APPROVED' ? <Eye className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-8 py-32 text-center">
                  <div className="flex flex-col items-center gap-3 opacity-20 grayscale">
                    <History className="w-16 h-16 text-slate-400" />
                    <p className="text-slate-500 font-black uppercase tracking-widest text-sm">
                      {t('calibration.cal.no_history')}
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && selectedRecord && (
        <CalibrationModal 
          isEdit={true}
          editData={selectedRecord}
          isOpenExternal={true}
          gageId={gage.id}
          gageName={gage.name}
          gageSpec={gage.spec || ''}
          calPoints={gage.calPoints} 
          acceptance={gage.acceptance} 
          calibrationCycle={gage.calibrationCycle}
          acceptanceStandard={gage.acceptanceStandard}
          vendors={vendors}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedRecord(null);
          }}
        />
      )}
    </>
  );
}
