"use client";

import React, { useState } from "react";
import { X, Save, Edit3, User, CheckCircle2, MessageSquare } from "lucide-react";
import { batchUpdateRecordsAction } from "@/app/actions/gage-actions";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface BatchRecordEditModalProps {
  selectedIds: string[];
  onSuccess: () => void;
}

export default function BatchRecordEditModal({ selectedIds, onSuccess }: BatchRecordEditModalProps) {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    const data: any = {};
    formData.forEach((value, key) => {
      if (value) {
        data[key] = value;
      }
    });

    if (Object.keys(data).length === 0) {
      alert(t('calibration.batch.at_least_one_field'));
      setIsSubmitting(false);
      return;
    }

    try {
      await batchUpdateRecordsAction(selectedIds, data);
      setIsOpen(false);
      onSuccess();
    } catch (error) {
      alert((t('calibration.cal.import_failed') || "Batch update failed") + ": " + (error instanceof Error ? error.message : "unknown error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-white text-slate-700 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-slate-50 transition-all border border-slate-200 shadow-sm"
      >
        <Edit3 className="w-4 h-4" /> {t('calibration.batch.batch_edit')} ({selectedIds.length})
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[70] flex items-center justify-center p-4 text-left">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100 animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
        <header className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center flex-shrink-0">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <Edit3 className="w-5 h-5 text-kst-blue" />
            {t('calibration.batch.batch_edit')} ({selectedIds.length} {t('calibration.cal.total_records')})
          </h3>
          <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-slate-200 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto">
          <p className="text-xs text-amber-600 bg-amber-50 p-3 rounded-lg font-medium">
            {t('calibration.batch.batch_edit_hint')}
          </p>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <User className="w-4 h-4 text-slate-400" /> {t('calibration.cal.inspector_label')}
              </label>
              <input 
                type="text" 
                name="inspector" 
                placeholder={t('calibration.cal.inspector_label')}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-kst-blue outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-slate-400" /> {t('calibration.cal.result')}
              </label>
              <select 
                name="result" 
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-kst-blue outline-none"
              >
                <option value="">{t('common.common.keep_unchanged')}</option>
                <option value="PASS">PASS ({t('common.status.pass')})</option>
                <option value="FAIL">FAIL ({t('calibration.cal.fail')})</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-slate-400" /> {t('quality.vendor.notes')}
              </label>
              <textarea 
                name="notes" 
                rows={3}
                placeholder={t('quality.vendor.notes')}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-kst-blue outline-none resize-none"
              />
            </div>
          </div>

          <footer className="pt-6 flex justify-end gap-3 border-t border-slate-50">
            <button 
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              {t('common.common.cancel')}
            </button>
            <button 
              disabled={isSubmitting}
              type="submit"
              className="px-6 py-2 bg-kst-blue text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-blue-100"
            >
              {isSubmitting ? t('common.common.updating') : (
                <>
                  <Save className="w-4 h-4" /> {t('calibration.cal.confirm_batch_update')}
                </>
              )}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}
