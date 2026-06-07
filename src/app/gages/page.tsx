import React from 'react';
import { GageService } from "@/services/gage-service";
import { 
  Search, 
  ChevronLeft,
  Plus
} from "lucide-react";
import Link from "next/link";
import { getTranslation } from '@/lib/i18n/server-translations';
import GageTable from "@/components/GageTable";
import { CategoryFilter } from '@/components/CategoryFilter';
import { VendorService } from '@/services/vendor-service';
import GageAddModal from "@/components/GageAddModal";

export default async function GagesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { t } = await getTranslation();
  const params = await searchParams;
  const query = typeof params.q === 'string' ? params.q : '';
  const location = typeof params.location === 'string' ? params.location : '';

  const categoryParam = typeof params.category === 'string' ? params.category : '';
  const currentCategories = categoryParam ? categoryParam.split(',') : [];
  
  const statusParam = typeof params.status === 'string' ? params.status : '';

  const allGages = await GageService.getAllGages();
  const categories = await GageService.getCategories();
  const vendors = await VendorService.getAllVendors();

  const filteredGages = allGages.filter(gage => {
    const matchesSearch = gage.id.toLowerCase().includes(query.toLowerCase()) || 
                         gage.name.toLowerCase().includes(query.toLowerCase()) ||
                         (gage.usageRange && gage.usageRange.toLowerCase().includes(query.toLowerCase()));
    const matchesLocation = location ? gage.location === location : true;
    const matchesCategory = currentCategories.length > 0 ? currentCategories.includes(gage.category) : true;
    
    let matchesStatus = true;
    if (statusParam === 'OVERDUE') {
      matchesStatus = gage.calculatedStatus === 'OVERDUE';
    } else if (statusParam === 'DUE_THIS_MONTH') {
      matchesStatus = (gage as any).isDueThisMonth;
    }
    
    return matchesSearch && matchesLocation && matchesCategory && matchesStatus;
  });

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-6">
      <header className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
        <div className="flex items-center gap-4">
          <Link href="/" className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-400">
            <ChevronLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">{t('calibration.gage.list')}</h1>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <span>{t('common.common.all')} {filteredGages.length} {t('calibration.gage.total')}</span>
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
              placeholder={t('calibration.gage.search_placeholder')} 
              className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm w-64 focus:ring-2 focus:ring-kst-blue focus:border-transparent outline-none transition-all"
            />
          </form>

          <CategoryFilter categories={categories} currentCategories={currentCategories} />
          


          <div className="h-8 w-px bg-slate-200 mx-2" />
          
          <GageAddModal />
        </div>
      </header>

      <GageTable gages={filteredGages} vendors={vendors} />
    </div>
  );
}
