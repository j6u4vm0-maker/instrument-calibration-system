'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Save, ShieldCheck, UploadCloud, X } from 'lucide-react';
import { createFixtureAction } from '@/app/actions/fixture-actions';
import { getAllFixtureCategoriesAction } from '@/app/actions/category-actions';
import { uploadReportAction } from '@/app/actions/upload-actions';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { SearchableSelect } from './SearchableSelect';
import { GageOrganizationSelector as FixtureOrganizationSelector } from './GageOrganizationSelector';

export default function FixtureAddModal() {
  const { t } = useLanguage();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [category, setCategory] = useState('');
  const [manualVal, setManualVal] = useState('');
  const [status, setStatus] = useState('IN_USE');
  const [acceptance, setAcceptance] = useState('');
  const [calPoints, setCalPoints] = useState('FAI撠箏站');
  const [cycle, setCycle] = useState(12);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    void (async () => {
      const cats = await getAllFixtureCategoriesAction();
      setCategories((cats || []).map((c: any) => c.name).filter(Boolean));
    })();
  }, [isOpen]);

  const handleManualUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', e.target.files[0]);
      const url = await uploadReportAction(formData);
      if (url) setManualVal(url);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const formData = new FormData(e.currentTarget);
      const quantity = parseInt(String(formData.get('quantity') || '1'), 10) || 1;
      const baseId = String(formData.get('id') || '');
      const baseSerialNo = String(formData.get('serialNo') || '');

      const template = {
        name: String(formData.get('name') || ''),
        applicablePart: String(formData.get('applicablePart') || ''),
        drawingNo: String(formData.get('drawingNo') || ''),
        manual: String(formData.get('manual') || ''),
        category,
        brand: String(formData.get('brand') || ''),
        displayType: String(formData.get('displayType') || ''),
        precision: '',
        calibrationCycle: cycle,
        standardId: null,
        acceptance,
        calPoints,
        locationId: String(formData.get('locationId') || '') || null,
        departmentId: String(formData.get('departmentId') || '') || null,
        custodianId: String(formData.get('custodianId') || '') || null,
        managerId: String(formData.get('managerId') || '') || null,
        rdIssuerId: String(formData.get('rdIssuerId') || '') || null,
        vendorId: String(formData.get('vendorId') || '') || null,
        notes,
        status,
        entryDate: formData.get('entryDate') ? new Date(String(formData.get('entryDate'))) : new Date(),
        lastCalDate: formData.get('lastCalDate') ? new Date(String(formData.get('lastCalDate'))) : new Date(),
      };

      const createOne = async (id: string, serialNo: string) => {
        const res = await createFixtureAction({ ...template, id, serialNo } as any);
        if (!res?.success) throw new Error(res?.error || 'Creation failed');
      };

      if (quantity === 1) {
        await createOne(baseId, baseSerialNo);
      } else {
        for (let i = 1; i <= quantity; i++) {
          await createOne(`${baseId}(${i})`, baseSerialNo ? `${baseSerialNo}(${i})` : `(${i})`);
        }
      }

      setIsOpen(false);
      router.refresh();
    } catch (error: any) {
      alert('Error creating fixture: ' + (error?.message || 'Unknown error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const labelStyle = 'block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2';
  const inputStyle = 'w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-kst-blue/20 focus:bg-white focus:border-kst-blue outline-none transition-all';

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2.5 bg-kst-blue text-white rounded-xl font-black hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95"
      >
        <Plus className="w-5 h-5" />
        <span>新增檢具</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden border border-slate-100 flex flex-col h-[90vh]">
            <header className="px-8 py-5 bg-[#ACD6FF] border-b border-blue-200 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-kst-blue rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
                  <ShieldCheck className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-black text-slate-800 text-lg">新增檢具</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Fixture Create</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </header>

            <form id="addFixtureForm" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
              <section className="space-y-5">
                <div className="flex flex-wrap -mx-3">
                  <div className="w-full md:w-1/2 px-3 mb-5">
                    <label className={labelStyle}>設備編號</label>
                    <input required type="text" name="id" className={inputStyle} />
                  </div>
                  <div className="w-full md:w-1/2 px-3 mb-5">
                    <label className={labelStyle}>組數</label>
                    <input required type="number" name="quantity" defaultValue={1} min={1} className={inputStyle} />
                  </div>
                  <div className="w-full md:w-1/2 px-3 mb-5">
                    <label className={labelStyle}>版次/序號</label>
                    <input type="text" name="serialNo" className={inputStyle} />
                  </div>
                  <div className="w-full md:w-1/2 px-3 mb-5">
                    <label className={labelStyle}>儀器設備名稱</label>
                    <input required type="text" name="name" className={inputStyle} />
                  </div>
                  <div className="w-full md:w-1/2 px-3 mb-5">
                    <label className={labelStyle}>適用料號</label>
                    <input type="text" name="applicablePart" className={inputStyle} />
                  </div>
                  <div className="w-full md:w-1/2 px-3 mb-5">
                    <label className={labelStyle}>對應圖號 / 檢驗書</label>
                    <input type="text" name="drawingNo" className={inputStyle} />
                  </div>
                  <div className="w-full md:w-1/2 px-3 mb-5">
                    <label className={labelStyle}>使用說明書</label>
                    <div className="flex gap-2">
                      <input type="text" name="manual" value={manualVal} onChange={e => setManualVal(e.target.value)} className={inputStyle} />
                      <label className={`shrink-0 flex items-center justify-center px-4 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
                        <UploadCloud className="w-4 h-4 text-slate-500" />
                        <input type="file" className="hidden" onChange={handleManualUpload} />
                      </label>
                    </div>
                  </div>
                  <div className="w-full md:w-1/2 px-3 mb-5">
                    <label className={labelStyle}>廠牌</label>
                    <input type="text" name="brand" className={inputStyle} />
                  </div>
                  <div className="w-full md:w-1/2 px-3 mb-5">
                    <label className={labelStyle}>入廠日期</label>
                    <input type="date" name="entryDate" className={inputStyle} />
                  </div>
                  <div className="w-full px-3 mb-5">
                    <label className={labelStyle}>檢具類別</label>
                    <SearchableSelect options={categories} value={category} onChange={setCategory} placeholder="請選擇或輸入檢具類別" />
                  </div>
                </div>
              </section>

              <section className="space-y-5">
                <div className="rounded-2xl border border-slate-200 bg-slate-100 p-6">
                  <FixtureOrganizationSelector />
                </div>
              </section>

              <section className="space-y-5">
                <div className="flex flex-wrap -mx-3">
                  <div className="w-full md:w-1/2 px-3 mb-5">
                    <label className={labelStyle}>校正週期(月)</label>
                    <input required type="number" name="calibrationCycle" value={cycle} onChange={e => setCycle(parseInt(e.target.value) || 0)} className={inputStyle} />
                  </div>
                  <div className="w-full md:w-1/2 px-3 mb-5">
                    <label className={labelStyle}>上次校正日</label>
                    <input type="date" name="lastCalDate" className={inputStyle} />
                  </div>
                  <div className="w-full px-3 mb-5">
                    <label className={labelStyle}>校正點位</label>
                    <textarea value={calPoints} onChange={e => setCalPoints(e.target.value)} className={`${inputStyle} min-h-[96px] resize-y`} />
                  </div>
                  <div className="w-full px-3 mb-5">
                    <label className={labelStyle}>允收標準</label>
                    <textarea value={acceptance} onChange={e => setAcceptance(e.target.value)} className={`${inputStyle} min-h-[96px] resize-y`} />
                  </div>
                  <div className="w-full px-3 mb-5">
                    <label className={labelStyle}>備註</label>
                    <textarea value={notes} onChange={e => setNotes(e.target.value)} className={`${inputStyle} h-24 resize-none`} />
                  </div>
                </div>
              </section>
            </form>

            <footer className="px-8 py-5 bg-slate-100 border-t border-slate-200 flex items-center gap-4 shrink-0">
              <button type="button" onClick={() => setIsOpen(false)} className="px-6 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all">
                取消
              </button>
              <div className="flex-1" />
              <button disabled={isSubmitting} form="addFixtureForm" type="submit" className="px-10 py-2.5 bg-kst-blue text-white rounded-xl text-sm font-black hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 flex items-center gap-2 disabled:opacity-50">
                {isSubmitting ? '儲存中...' : (<><Save className="w-4 h-4" />新增</>)}
              </button>
            </footer>
          </div>
        </div>
      )}
    </>
  );
}
