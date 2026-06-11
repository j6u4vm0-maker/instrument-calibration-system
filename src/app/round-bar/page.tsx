import React from 'react';
import { RoundBarService } from "@/services/round-bar-service";
import { 
  Search, 
  ChevronLeft
} from "lucide-react";
import Link from "next/link";
import { getTranslation } from '@/lib/i18n/server-translations';
import RoundBarTable from "@/components/RoundBarTable";
import RoundBarAddModal from "@/components/RoundBarAddModal";

export default async function RoundBarPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { t } = await getTranslation();
  const params = await searchParams;
  const query = typeof params.q === 'string' ? params.q : '';

  const roundBars = await RoundBarService.getRoundBars({ search: query });

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-6">
      <header className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
        <div className="flex items-center gap-4">
          <Link href="/" className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-400">
            <ChevronLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">{t('roundBar.title')}</h1>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <span>{t('common.common.all')} {roundBars.length} {t('calibration.gage.total')}</span>
              <span className="text-slate-300">|</span>
              <span>{t('common.settings.system_title')}</span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          <form className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              name="q"
              defaultValue={query}
              placeholder={t('roundBar.search')} 
              className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm w-64 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all"
            />
          </form>

          <div className="h-8 w-px bg-slate-200 mx-2" />
          
          <RoundBarAddModal />
        </div>
      </header>

      <RoundBarTable roundBars={roundBars} />
    </div>
  );
}
