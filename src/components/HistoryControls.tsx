'use client';

import React, { useRef, useState } from 'react';
import { Upload, Download, Loader2 } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { importRecordsAction } from '@/app/actions/gage-actions';

export function HistoryControls() {
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [timestamp, setTimestamp] = useState<string>('');

  React.useEffect(() => {
    setTimestamp(Date.now().toString());
  }, []);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

      try {
        const result = await importRecordsAction(formData);
        if (result.success) {
          alert(`${t('calibration.cal.import_success') || 'Import Success'}: ${result.count} ${t('calibration.cal.history')}`);
          window.location.reload();
        }
      } catch (error) {
        console.error('Import failed:', error);
        alert(t('calibration.cal.import_failed'));
      } finally {
        setIsUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
  
    return (
      <div className="flex gap-3">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".xlsx, .xls, .csv"
          className="hidden"
        />
        
        <button
          onClick={handleImportClick}
          disabled={isUploading}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg font-bold hover:bg-slate-50 transition-all shadow-sm disabled:opacity-50"
        >
          {isUploading ? (
            <Loader2 className="w-4 h-4 animate-spin text-kst-blue" />
          ) : (
            <Upload className="w-4 h-4 text-kst-blue" />
          )}
          <span>{isUploading ? t('calibration.cal.processing') : t('common.common.upload')}</span>
        </button>
  
        <a
          href={`/api/reports/export?t=${timestamp}`}
          download
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg font-bold hover:bg-slate-50 transition-all shadow-sm"
        >
          <Download className="w-4 h-4 text-emerald-500" />
          <span>{t('common.common.download')}</span>
        </a>
      </div>
    );
  }
