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

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="px-6 py-4 font-bold text-slate-500">{t('quality.vendor.name')}</th>
                <th className="px-6 py-4 font-bold text-slate-500">{t('quality.vendor.contact')}</th>
                <th className="px-6 py-4 font-bold text-slate-500">{t('quality.vendor.phone')}</th>
                <th className="px-6 py-4 font-bold text-slate-500">{t('quality.vendor.email')}</th>
                <th className="px-6 py-4 font-bold text-slate-500">{t('calibration.cal.history')}</th>
                <th className="px-6 py-4 font-bold text-slate-500 w-24 text-center">{t('common.common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {vendors.map((vendor) => (
                <tr key={vendor.id} className="border-b border-slate-50 hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-50 rounded-lg text-kst-blue">
                        <Building className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-800">{vendor.name}</div>
                        {vendor.vendorCode && (
                          <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                            <Hash className="w-3 h-3" />
                            {vendor.vendorCode}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-slate-600">
                      <User className="w-4 h-4 text-slate-400" />
                      {vendor.contact || <span className="text-slate-400 italic">{t('common.common.unassigned')}</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      {vendor.phone && (
                        <div className="flex items-center gap-2 text-slate-600 text-xs">
                          <Phone className="w-3 h-3 text-slate-400" />
                          {vendor.phone}
                        </div>
                      )}
                      {vendor.mobile && (
                        <div className="flex items-center gap-2 text-slate-600 text-xs">
                          <Smartphone className="w-3 h-3 text-slate-400" />
                          {vendor.mobile}
                        </div>
                      )}
                      {!vendor.phone && !vendor.mobile && <span className="text-slate-400 italic">-</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {vendor.email ? (
                      <div className="flex items-center gap-2 text-slate-600">
                        <Mail className="w-4 h-4 text-slate-400" />
                        <span className="truncate max-w-[200px]" title={vendor.email}>{vendor.email}</span>
                      </div>
                    ) : <span className="text-slate-400 italic">-</span>}
                  </td>
                  <td className="px-6 py-4">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 text-xs font-medium">
                      <History className="w-3 h-3" />
                      {vendor.records?.length || 0}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-3">
                      <Link 
                        href={`/vendors/${vendor.id}`} 
                        className="text-kst-blue hover:text-blue-700 font-bold tooltip-trigger"
                        title={t('common.common.details')}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                      <form action={deleteVendorAction.bind(null, vendor.id)}>
                        <button 
                          className="text-slate-400 hover:text-red-500 font-bold tooltip-trigger"
                          title={t('common.common.delete')}
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
              {vendors.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-20 text-center text-slate-400 font-medium bg-slate-50">
                    <Building className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                    {t('quality.vendor.no_data')}
                    <div className="mt-2">
                      <Link href="/vendors/new" className="text-kst-blue font-bold hover:underline">
                        {t('quality.vendor.add')}
                      </Link>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
