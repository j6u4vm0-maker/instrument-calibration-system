import React from 'react';
import { FixtureService } from "@/services/fixture-service";
import { 
  Search, 
  ChevronLeft,
  Plus
} from "lucide-react";
import Link from "next/link";
import { getTranslation } from '@/lib/i18n/server-translations';
import FixtureTable from "@/components/FixtureTable";
import { CategoryFilter } from '@/components/CategoryFilter';
import { VendorService } from '@/services/vendor-service';
import FixtureAddModal from "@/components/FixtureAddModal";

export default async function FixturesPage({
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

  const allFixtures = await FixtureService.getAllFixtures();
  const categories: string[] = []; // Fixtures don't have dedicated categories yet, but we can extract them if needed later
  const vendors = await VendorService.getAllVendors();

  const filteredFixtures = allFixtures.filter(fixture => {
    const matchesSearch = fixture.id.toLowerCase().includes(query.toLowerCase()) || 
                         fixture.name.toLowerCase().includes(query.toLowerCase()) ||
                         (fixture.applicablePart && fixture.applicablePart.toLowerCase().includes(query.toLowerCase()));
                         
    const matchesLocation = location ? fixture.locationRef?.name === location || fixture.location === location : true;
    
    // For now we skip category filtering for fixtures unless we implement category extraction
    const matchesCategory = currentCategories.length > 0 ? currentCategories.includes(fixture.category || '') : true;
    
    let matchesStatus = true;
    if (statusParam === 'OVERDUE') {
      matchesStatus = fixture.calculatedStatus === 'OVERDUE';
    } else if (statusParam === 'DUE_THIS_MONTH') {
      matchesStatus = (fixture as any).isDueThisMonth;
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
            <h1 className="text-2xl font-bold text-slate-800">檢具清冊</h1>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <span>{t('common.common.all')} {filteredFixtures.length} 總計</span>
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
              placeholder="搜尋編號、名稱或適用料號..." 
              className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm w-64 focus:ring-2 focus:ring-kst-blue focus:border-transparent outline-none transition-all"
            />
          </form>

          {/* <CategoryFilter categories={categories} currentCategories={currentCategories} /> */}
          


          <FixtureAddModal allCategories={[]} standards={[]} />
        </div>
      </header>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden relative z-0">
        <FixtureTable fixtures={filteredFixtures} vendors={vendors} />
      </div>
    </div>
  );
}
