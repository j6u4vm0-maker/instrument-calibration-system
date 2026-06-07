import React from 'react';
import { GageService } from "@/services/gage-service";
import { VendorService } from '@/services/vendor-service';
import BatchCalibrationForm from "@/components/BatchCalibrationForm";
import { getTranslation } from '@/lib/i18n/server-translations';

export default async function BatchCalibratePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { t } = await getTranslation();
  const params = await searchParams;
  const idsParam = typeof params.ids === 'string' ? params.ids : '';
  const selectedIds = idsParam ? idsParam.split(',') : [];

  if (selectedIds.length === 0) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold text-slate-800">{t('no_instruments_selected')}</h2>
        <p className="text-slate-500 mt-2">{t('return_and_try_again')}</p>
      </div>
    );
  }

  // 獲取選中的儀器詳細資料
  const allGages = await GageService.getAllGages();
  const selectedGages = allGages.filter(g => selectedIds.includes(g.id));
  const vendors = await VendorService.getAllVendors();

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <BatchCalibrationForm 
        selectedGages={selectedGages} 
        vendors={vendors} 
      />
    </div>
  );
}
