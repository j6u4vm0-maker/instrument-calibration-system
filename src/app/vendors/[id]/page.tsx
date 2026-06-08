import type { ReactNode } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getTranslation } from '@/lib/i18n/server-translations';
import { VendorService } from '@/services/vendor-service';
import { deleteVendorAction } from '@/app/actions/vendor-actions';
import {
  Building,
  ChevronLeft,
  ExternalLink,
  FileText,
  Globe,
  Hash,
  Mail,
  MapPin,
  Phone,
  Smartphone,
  Trash2,
  User,
  History,
} from 'lucide-react';

function FieldRow({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value?: React.ReactNode;
}) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 text-sm text-slate-600">
      <div className="mt-0.5 text-slate-400">{icon}</div>
      <div className="min-w-0">
        <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</div>
        <div className="font-medium break-words">{value}</div>
      </div>
    </div>
  );
}

export default async function VendorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { t, language } = await getTranslation();
  const { id } = await params;
  const decodedId = decodeURIComponent(id);
  const vendor = await VendorService.getVendorById(decodedId);

  if (!vendor) notFound();

  const dateLocale = language === 'zh' ? 'zh-TW' : 'en-US';
  const backLabel = language === 'en-US' ? 'Back' : '返回';
  const lastRecord = vendor.records?.[0];

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <header className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
          <Link href="/vendors" className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-400">
            <ChevronLeft className="w-6 h-6" />
          </Link>
          <div className="min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="p-2 bg-kst-blue/10 rounded-lg text-kst-blue">
                <Building className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-bold text-slate-800 truncate">{vendor.name}</h1>
            </div>
            <p className="text-slate-500 text-sm mt-1">{t('quality.vendor.mgmt')}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/vendors/${encodeURIComponent(vendor.id)}/edit`}
            className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            {t('common.common.edit')}
          </Link>
          <form action={deleteVendorAction.bind(null, vendor.id)}>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-red-50 text-red-600 text-sm font-bold hover:bg-red-100 transition-colors inline-flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              {t('common.common.delete')}
            </button>
          </form>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm p-8 space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-slate-50 rounded-2xl text-kst-blue">
              <Building className="w-6 h-6" />
            </div>
            <div>
              <div className="text-lg font-bold text-slate-800">{vendor.shortName || vendor.name}</div>
              <div className="text-sm text-slate-500">{vendor.type}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FieldRow icon={<Hash className="w-4 h-4" />} label="Vendor Code" value={vendor.vendorCode || '-'} />
            <FieldRow icon={<User className="w-4 h-4" />} label={t('common.common.contact')} value={vendor.contact || t('common.common.unassigned')} />
            <FieldRow icon={<Phone className="w-4 h-4" />} label={t('quality.vendor.phone')} value={vendor.phone || '-'} />
            <FieldRow icon={<Smartphone className="w-4 h-4" />} label={t('quality.vendor.mobile')} value={vendor.mobile || '-'} />
            <FieldRow icon={<Mail className="w-4 h-4" />} label={t('quality.vendor.email')} value={vendor.email || '-'} />
            <FieldRow icon={<MapPin className="w-4 h-4" />} label={t('quality.vendor.address')} value={vendor.address || '-'} />
            <FieldRow
              icon={<Globe className="w-4 h-4" />}
              label={t('quality.vendor.website')}
              value={
                vendor.website ? (
                  <a href={vendor.website} target="_blank" rel="noreferrer" className="text-kst-blue hover:underline inline-flex items-center gap-1">
                    {vendor.website}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ) : '-'
              }
            />
          </div>

          <div className="space-y-4">
            <div>
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">{t('quality.vendor.service_scope')}</div>
              <div className="bg-slate-50 rounded-2xl border border-slate-100 p-4 text-sm text-slate-700 whitespace-pre-wrap">
                {vendor.serviceScope || '-'}
              </div>
            </div>
            <div>
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">{t('common.common.notes')}</div>
              <div className="bg-slate-50 rounded-2xl border border-slate-100 p-4 text-sm text-slate-700 whitespace-pre-wrap">
                {vendor.notes || '-'}
              </div>
            </div>
          </div>
        </section>

        <aside className="space-y-6">
          <section className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-4">
            <div className="text-sm font-black uppercase tracking-widest text-slate-400">{t('calibration.cal.history')}</div>
            <div className="flex items-center justify-between rounded-2xl bg-slate-50 border border-slate-100 p-4">
              <div>
                <div className="text-xs text-slate-400 font-bold">Records</div>
                <div className="text-2xl font-black text-slate-800">{vendor.records?.length || 0}</div>
              </div>
              <History className="w-8 h-8 text-kst-blue" />
            </div>
            <div className="text-sm text-slate-500">
              {lastRecord ? (
                <>
                  {lastRecord.gage?.id} · {new Date(lastRecord.calDate).toLocaleDateString(dateLocale)}
                </>
              ) : (
                t('calibration.cal.no_history')
              )}
            </div>
          </section>

          <section className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
            <div className="text-sm font-black uppercase tracking-widest text-slate-400 mb-4">Quick Actions</div>
            <Link
              href="/vendors"
              className="block text-center px-4 py-3 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors"
            >
            {backLabel}
          </Link>
          </section>
        </aside>
      </div>

      <section className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50">
          <h2 className="text-lg font-bold text-slate-800">{t('calibration.cal.history')}</h2>
        </div>
        <div className="divide-y divide-slate-100">
          {(vendor.records || []).length > 0 ? (
            vendor.records.map((record) => (
              <div key={record.id} className="p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <div className="font-bold text-slate-800">{record.gage?.id || '-'}</div>
                  <div className="text-sm text-slate-500">
                    {new Date(record.calDate).toLocaleDateString(dateLocale)} · {record.result}
                  </div>
                </div>
                <div className="text-sm text-slate-500">{record.certificateNo || '-'}</div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-slate-400">{t('calibration.cal.no_history')}</div>
          )}
        </div>
      </section>
    </div>
  );
}
