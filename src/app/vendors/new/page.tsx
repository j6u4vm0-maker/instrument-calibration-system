import React from 'react';
import { Building, User, Phone, Mail, MapPin, Save, ChevronLeft, FileText, Hash, Smartphone, Globe, Printer } from "lucide-react";
import Link from "next/link";
import { createVendorAction } from '@/app/actions/vendor-actions';
import { redirect } from 'next/navigation';
import { getTranslation } from '@/lib/i18n/server-translations';

export default async function NewVendorPage() {
  const { t } = await getTranslation();

  async function handleSubmit(formData: FormData) {
    'use server';
    await createVendorAction(formData);
    redirect('/vendors');
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <header className="flex items-center gap-4">
        <Link href="/vendors" className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-400">
          <ChevronLeft className="w-6 h-6" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">新增廠商</h1>
          <p className="text-slate-500 text-sm">建立新的供應商或校正單位資料</p>
        </div>
      </header>

      <form action={handleSubmit} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl space-y-6">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <Hash className="w-4 h-4 text-slate-400" /> 廠商代碼
              </label>
              <input 
                type="text" 
                name="vendorCode" 
                placeholder="例如：J0241"
                className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-kst-blue/20 outline-none transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <Building className="w-4 h-4 text-slate-400" /> 廠商簡稱
              </label>
              <input 
                type="text" 
                name="shortName" 
                placeholder="廠商簡稱"
                className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-kst-blue/20 outline-none transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <Building className="w-4 h-4 text-kst-blue" /> 廠商名稱 *
            </label>
            <input 
              required 
              type="text" 
              name="name" 
              placeholder="廠商名稱"
              className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-kst-blue/20 outline-none transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <Building className="w-4 h-4 text-slate-400" /> 廠商類別 *
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                <input type="radio" name="type" value="OUTSOURCE" defaultChecked className="text-kst-blue focus:ring-kst-blue" />
                委外加工供應商
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                <input type="radio" name="type" value="CALIBRATION" className="text-kst-blue focus:ring-kst-blue" />
                外校供應商
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                <input type="radio" name="type" value="OEM_CALIBRATION" className="text-kst-blue focus:ring-kst-blue" />
                原廠/校正
              </label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <User className="w-4 h-4 text-slate-400" /> 聯絡人
              </label>
              <input 
                type="text" 
                name="contact" 
                placeholder="聯絡人"
                className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-kst-blue/20 outline-none transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-400" /> 電話
              </label>
              <input 
                type="text" 
                name="phone" 
                placeholder="02-XXXX-XXXX"
                className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-kst-blue/20 outline-none transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-slate-400" /> 行動電話
              </label>
              <input 
                type="text" 
                name="mobile" 
                placeholder="09XX-XXX-XXX"
                className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-kst-blue/20 outline-none transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <Printer className="w-4 h-4 text-slate-400" /> 傳真
              </label>
              <input 
                type="text" 
                name="fax" 
                placeholder="02-XXXX-XXXX"
                className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-kst-blue/20 outline-none transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-400" /> 電子信箱
              </label>
              <input 
                type="email" 
                name="email" 
                placeholder="service@example.com"
                className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-kst-blue/20 outline-none transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <Globe className="w-4 h-4 text-slate-400" /> 網站
              </label>
              <input 
                type="url" 
                name="website" 
                placeholder="https://example.com"
                className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-kst-blue/20 outline-none transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-400" /> 地址
              </label>
              <input 
                type="text" 
                name="address" 
                placeholder="地址"
                className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-kst-blue/20 outline-none transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-400" /> 服務 / 校正項目
            </label>
            <textarea 
              name="serviceScope" 
              rows={3}
              placeholder="例如：外校、委外加工、特定量測項目"
              className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-kst-blue/20 outline-none transition-all resize-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-400" /> 備註
            </label>
            <textarea 
              name="notes" 
              rows={3}
              placeholder="備註"
              className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-kst-blue/20 outline-none transition-all resize-none"
            />
          </div>
        </div>

        <div className="pt-4 flex gap-4">
          <Link 
            href="/vendors" 
            className="flex-1 px-6 py-3 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors text-center"
          >
            取消
          </Link>
          <button 
            type="submit"
            className="flex-1 px-6 py-3 bg-kst-blue text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" /> 儲存廠商
          </button>
        </div>
      </form>
    </div>
  );
}
