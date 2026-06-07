import React from 'react'; 
import { StandardService } from "@/services/standard-service";
import { 
  ShieldCheck, 
  ChevronLeft,
  Plus,
  Trash2,
  Edit2,
  AlertCircle
} from "lucide-react";
import Link from "next/link";
import { getTranslation } from '@/lib/i18n/server-translations';
import StandardEditorModal from '@/components/StandardEditorModal';
import { StandardImportExportButtons } from '@/components/StandardImportExportButtons';
import DeleteStandardButton from '@/components/DeleteStandardButton';

export default async function StandardsPage() {
  const { t } = await getTranslation();
  const standards = await StandardService.getAllAcceptanceStandards();

  return (
    <div className="p-8 max-w-[1200px] mx-auto space-y-8">
      <header className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link href="/" className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-400">
            <ChevronLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-kst-blue" />
              {t('calibration.cal.acceptance_standards_library')}
            </h1>
            <p className="text-sm text-slate-500">{t('calibration.cal.manage_calibration_standards_desc')}</p>
          </div>
        </div>
        <div className="flex items-center">
          <StandardImportExportButtons standards={standards} />
          <StandardEditorModal />
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {standards.map((standard) => (
          <div key={standard.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group overflow-hidden flex flex-col">
            <div className="p-6 flex-1 space-y-4">
              <div className="flex justify-between items-start">
                <div className="w-10 h-10 bg-kst-blue/10 rounded-xl flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6 text-kst-blue" />
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <StandardEditorModal standard={standard} />
                  <DeleteStandardButton 
                    id={standard.id} 
                    name={standard.name} 
                    linkedGages={(standard as any)._count?.gages || 0} 
                  />
                </div>
              </div>
              
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-800">{standard.name}</h3>
                  {standard.targetCategory && (
                    <span className="px-2 py-0.5 bg-blue-50 text-kst-blue text-[10px] font-bold rounded-full border border-blue-100">
                      {standard.targetCategory}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{standard.description || t('calibration.cal.no_description')}</p>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-50">
                <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <span>{t('calibration.cal.criteria_points')}</span>
                  <span>{standard.criteria.length} {t('calibration.cal.items')}</span>
                </div>
                <div className="space-y-1.5">
                  {standard.criteria.slice(0, 3).map((c, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs bg-slate-50 px-2 py-1.5 rounded-lg border border-slate-100">
                      <span className="text-slate-600 font-mono">
                        {c.rangeStart}-{c.rangeEnd}{c.unit || 'mm'}
                      </span>
                      <span className="font-bold text-kst-blue">
                        ±{c.tolerancePlus}
                      </span>
                    </div>
                  ))}
                  {standard.criteria.length > 3 && (
                    <div className="text-[10px] text-center text-slate-400 font-bold py-1">
                      + {standard.criteria.length - 3} {t('calibration.cal.more_items')}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-[10px] font-bold text-slate-500">{(standard as any)._count?.gages || 0} {t('calibration.cal.linked_gages')}</span>
              </div>
              <span className="text-[10px] font-bold text-slate-400">{standard.type}</span>
            </div>
          </div>
        ))}

        {standards.length === 0 && (
          <div className="col-span-full py-20 text-center space-y-4 bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-200">
            <AlertCircle className="w-12 h-12 text-slate-300 mx-auto" />
            <div className="space-y-1">
              <p className="text-slate-500 font-bold">{t('calibration.cal.no_standards_yet')}</p>
              <p className="text-sm text-slate-400">{t('calibration.cal.click_plus_to_add')}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
