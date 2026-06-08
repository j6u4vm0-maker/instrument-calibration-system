import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { getTranslation } from '@/lib/i18n/server-translations';
import { VendorService } from '@/services/vendor-service';
import { updateVendorAction } from '@/app/actions/vendor-actions';
import { Building, ChevronLeft, FileText, Globe, Hash, Mail, MapPin, Phone, Save, Smartphone, User } from 'lucide-react';

export default async function EditVendorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { t, language } = await getTranslation();
  const { id } = await params;
  const decodedId = decodeURIComponent(id);
  const vendor = await VendorService.getVendorById(decodedId);

  if (!vendor) notFound();

  async function handleSubmit(formData: FormData) {
    'use server';
    await updateVendorAction(decodedId, formData);
    redirect(`/vendors/${encodeURIComponent(decodedId)}`);
  }

  const backLabel = language === 'en-US' ? 'Back' : '返回';

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <header className="flex items-center gap-4">
        <Link href={`/vendors/${encodeURIComponent(decodedId)}`} className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-400">
          <ChevronLeft className="w-6 h-6" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
            <Building className="w-6 h-6 text-kst-blue" />
            {t('quality.vendor.edit')}
          </h1>
          <p className="text-slate-500 text-sm mt-1">{vendor.name}</p>
        </div>
      </header>

      <form action={handleSubmit} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <Hash className="w-4 h-4 text-slate-400" /> Vendor Code
            </label>
            <input name="vendorCode" defaultValue={vendor.vendorCode || ''} className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-kst-blue/20 outline-none transition-all" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <Building className="w-4 h-4 text-slate-400" /> {t('quality.vendor.name')}
            </label>
            <input required name="name" defaultValue={vendor.name} className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-kst-blue/20 outline-none transition-all" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <User className="w-4 h-4 text-slate-400" /> {t('quality.vendor.contact')}
            </label>
            <input name="contact" defaultValue={vendor.contact || ''} className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-kst-blue/20 outline-none transition-all" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <Phone className="w-4 h-4 text-slate-400" /> {t('quality.vendor.phone')}
            </label>
            <input name="phone" defaultValue={vendor.phone || ''} className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-kst-blue/20 outline-none transition-all" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-slate-400" /> {t('quality.vendor.mobile')}
            </label>
            <input name="mobile" defaultValue={vendor.mobile || ''} className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-kst-blue/20 outline-none transition-all" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <Mail className="w-4 h-4 text-slate-400" /> {t('quality.vendor.email')}
            </label>
            <input name="email" type="email" defaultValue={vendor.email || ''} className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-kst-blue/20 outline-none transition-all" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <Globe className="w-4 h-4 text-slate-400" /> {t('quality.vendor.website')}
            </label>
            <input name="website" defaultValue={vendor.website || ''} className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-kst-blue/20 outline-none transition-all" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-slate-400" /> {t('quality.vendor.address')}
            </label>
            <input name="address" defaultValue={vendor.address || ''} className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-kst-blue/20 outline-none transition-all" />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <FileText className="w-4 h-4 text-slate-400" /> {t('quality.vendor.service_scope')}
          </label>
          <textarea name="serviceScope" rows={3} defaultValue={vendor.serviceScope || ''} className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-kst-blue/20 outline-none transition-all resize-none" />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <FileText className="w-4 h-4 text-slate-400" /> {t('common.common.notes')}
          </label>
          <textarea name="notes" rows={3} defaultValue={vendor.notes || ''} className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-kst-blue/20 outline-none transition-all resize-none" />
        </div>

        <div className="pt-4 flex gap-4">
          <Link href={`/vendors/${encodeURIComponent(decodedId)}`} className="flex-1 px-6 py-3 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors text-center">
            {backLabel}
          </Link>
          <button type="submit" className="flex-1 px-6 py-3 bg-kst-blue text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-2">
            <Save className="w-4 h-4" /> {t('common.common.save_changes')}
          </button>
        </div>
      </form>
    </div>
  );
}
