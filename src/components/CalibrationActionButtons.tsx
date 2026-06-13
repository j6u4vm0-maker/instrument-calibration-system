"use client";

import { Save, Send } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface CalibrationActionButtonsProps {
  isReadOnly?: boolean;
  isSubmitting: boolean;
  onCancel?: () => void;
  onSubmit: (e: React.FormEvent, status: 'DRAFT' | 'PENDING') => void;
}

export function CalibrationActionButtons({
  isReadOnly,
  isSubmitting,
  onCancel,
  onSubmit
}: CalibrationActionButtonsProps) {
  const { t } = useLanguage();

  return (
    <div className="flex gap-4 pt-4 border-t border-slate-50">
      <button 
        type="button"
        onClick={onCancel}
        className="flex-1 px-6 py-4 border border-slate-200 rounded-2xl text-sm font-bold text-slate-500 hover:bg-slate-50 transition-colors"
      >
        {isReadOnly ? t('common.common.close') || '關閉' : t('common.common.cancel') || "取消"}
      </button>
      
      {!isReadOnly && (
        <>
          <button 
            type="button"
            disabled={isSubmitting}
            onClick={(e) => onSubmit(e as any, 'DRAFT')}
            className="flex-1 px-6 py-4 bg-slate-100 text-slate-600 rounded-2xl text-sm font-bold hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
          >
            <Save className="w-5 h-5" /> {t('calibration.cal.status_draft')}
          </button>
          <button 
            type="button"
            disabled={isSubmitting}
            onClick={(e) => onSubmit(e as any, 'PENDING')}
            className="flex-[2] px-6 py-4 bg-kst-blue text-white rounded-2xl text-sm font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-xl shadow-blue-500/20"
          >
            {isSubmitting ? t('calibration.cal.processing') : (
              <>
                <Send className="w-5 h-5" /> {t('calibration.cal.submit_review')}
              </>
            )}
          </button>
        </>
      )}
    </div>
  );
}
