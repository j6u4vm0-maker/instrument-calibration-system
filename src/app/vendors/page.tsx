import React from 'react';
import { VendorService } from "@/services/vendor-service";
import { 
  Building, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Plus, 
  History,
  ExternalLink,
  Globe,
  Hash,
  Smartphone,
  FileText,
} from "lucide-react";
import Link from "next/link";
import { getTranslation } from '@/lib/i18n/server-translations';
import { createVendorAction, deleteVendorAction } from '@/app/actions/vendor-actions';
import { VendorImportExportButtons } from '@/components/VendorImportExportButtons';

export default async function VendorsPage({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  const { t } = await getTranslation();
  const params = await searchParams;
  const activeType = params.type || 'OUTSOURCE';
  const vendorTypes = [
    { value: 'OUTSOURCE', label: '委外加工供應商' },
    { value: 'CALIBRATION', label: '外校供應商' },
    { value: 'OEM_CALIBRATION', label: '原廠/校正' },
  ];
  const vendors = await VendorService.getAllVendors(activeType);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
            <div className="p-2 bg-kst-blue/10 rounded-lg text-kst-blue">
              <Building className="w-6 h-6" />
            </div>
            {t('quality.vendor.mgmt')}
          </h1>
          <p className="text-slate-500 text-sm mt-1">{t('quality.vendor.desc')}</p>
        </div>
        
        <div className="flex gap-2">
           <VendorImportExportButtons vendors={vendors} defaultType={activeType} />
           <Link href="/vendors/new" className="px-4 py-2 bg-kst-blue text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center gap-2">
             <Plus className="w-4 h-4" /> {t('quality.vendor.add')}
           </Link>
        </div>
      </header>

      <div className="flex gap-4 border-b border-slate-200">
        {vendorTypes.map((type) => (
          <Link 
            key={type.value}
            href={`/vendors?type=${type.value}`}
            className={`pb-4 px-2 font-bold text-sm transition-colors border-b-2 ${
              activeType === type.value
                ? 'border-kst-blue text-kst-blue' 
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {type.label}
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vendors.map((vendor) => (
          <div key={vendor.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow group">
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-start">
                <div className="p-3 bg-blue-50 rounded-xl group-hover:bg-kst-blue group-hover:text-white transition-colors">
                  <Building className="w-6 h-6" />
                </div>
                <div className="flex gap-2">
                   <form action={deleteVendorAction.bind(null, vendor.id)}>
                      <button className="text-xs text-slate-400 hover:text-red-500 font-bold">{t('common.common.delete')}</button>
                   </form>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-bold text-slate-800">{vendor.name}</h3>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                  {vendor.vendorCode && (
                    <span className="inline-flex items-center gap-1">
                      <Hash className="w-3 h-3" />
                      {vendor.vendorCode}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {vendor.contact || t('common.common.unassigned')}
                  </span>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                {vendor.phone && (
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <Phone className="w-4 h-4 text-slate-400" />
                    {vendor.phone}
                  </div>
                )}
                {vendor.mobile && (
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <Smartphone className="w-4 h-4 text-slate-400" />
                    {vendor.mobile}
                  </div>
                )}
                {vendor.email && (
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <span className="truncate">{vendor.email}</span>
                  </div>
                )}
                {vendor.address && (
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <span className="truncate">{vendor.address}</span>
                  </div>
                )}
                {vendor.website && (
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <Globe className="w-4 h-4 text-slate-400" />
                    <a href={vendor.website} target="_blank" rel="noreferrer" className="truncate text-kst-blue hover:underline">
                      {vendor.website}
                    </a>
                  </div>
                )}
                {vendor.serviceScope && (
                  <div className="flex items-start gap-3 text-sm text-slate-600">
                    <FileText className="mt-0.5 w-4 h-4 text-slate-400" />
                    <span className="line-clamp-2">{vendor.serviceScope}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 flex justify-between items-center">
              <div className="text-xs font-bold text-slate-500 flex items-center gap-1">
                <History className="w-3 h-3" />
                {t('calibration.cal.history')}: {vendor.records?.length || 0}
              </div>
              <Link href={`/vendors/${vendor.id}`} className="text-xs font-bold text-kst-blue hover:underline flex items-center gap-1">
                {t('common.common.details')} <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </div>
        ))}
        
        {vendors.length === 0 && (
          <div className="col-span-full py-20 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
            <Building className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-400 font-medium">{t('quality.vendor.no_data')}</p>
            <Link href="/vendors/new" className="text-kst-blue font-bold mt-2 inline-block hover:underline">{t('quality.vendor.add')}</Link>
          </div>
        )}
      </div>
    </div>
  );
}
