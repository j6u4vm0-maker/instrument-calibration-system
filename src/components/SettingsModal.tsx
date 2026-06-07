'use client';

import React from 'react';
import { X, Check, Globe, Shield, Database, Download, Upload } from 'lucide-react';
import { useLanguage, Role } from '@/lib/i18n/LanguageContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { language, setLanguage, role, setRole, t } = useLanguage();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h3 className="text-xl font-bold text-slate-800">{t('common.settings.title')}</h3>
            <p className="text-sm text-slate-500 mt-1">{t('common.settings.desc')}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Language Section */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-slate-400">
              <Globe className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">{t('common.settings.language')}</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setLanguage('zh-TW')}
                className={`flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all ${
                  language === 'zh-TW' || language === 'zh'
                    ? 'border-kst-blue bg-blue-50/50 text-kst-blue' 
                    : 'border-slate-100 hover:border-slate-200 text-slate-600'
                }`}
              >
                <span className="font-bold">{t('common.settings.zh')}</span>
                {(language === 'zh-TW' || language === 'zh') && <Check className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setLanguage('en-US')}
                className={`flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all ${
                  language === 'en-US' || language === 'en'
                    ? 'border-kst-blue bg-blue-50/50 text-kst-blue' 
                    : 'border-slate-100 hover:border-slate-200 text-slate-600'
                }`}
              >
                <span className="font-bold">{t('common.settings.en')}</span>
                {(language === 'en-US' || language === 'en') && <Check className="w-4 h-4" />}
              </button>
            </div>
          </section>

          {/* Database Management Section */}
          <section className="space-y-4 pt-6 border-t border-slate-100">
            <div className="flex items-center gap-2 text-slate-400">
              <Database className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">{language === 'zh-TW' ? '資料庫管理' : 'Database Management'}</span>
            </div>
            <div className="grid grid-cols-1 gap-3">
              <a 
                href="/api/database/export"
                download
                className="flex items-center justify-center gap-2 w-full py-3 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-100 transition-all"
              >
                <Download className="w-4 h-4" />
                {language === 'zh-TW' ? '匯出備份 (.db)' : 'Export Backup (.db)'}
              </a>
              <label className="flex items-center justify-center gap-2 w-full py-3 bg-red-50 border border-red-100 text-red-600 rounded-xl font-bold hover:bg-red-100 transition-all cursor-pointer">
                <Upload className="w-4 h-4" />
                {language === 'zh-TW' ? '還原資料庫' : 'Restore Database'}
                <input 
                  type="file" 
                  accept=".db" 
                  className="hidden" 
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;

                    const confirmMsg = language === 'zh-TW' 
                      ? '⚠️ 警告：還原資料庫將會【完全覆蓋】目前的系統資料！\n\n系統會自動備份當前狀態，但仍建議您先手動匯出備份以防萬一。\n\n您確定要繼續還原嗎？'
                      : '⚠️ WARNING: Restoring the database will COMPLETELY OVERWRITE current data!\n\nAre you sure you want to proceed?';

                    if (!confirm(confirmMsg)) {
                      e.target.value = ''; // Reset
                      return;
                    }

                    const formData = new FormData();
                    formData.append('file', file);

                    try {
                      const res = await fetch('/api/database/import', {
                        method: 'POST',
                        body: formData
                      });
                      
                      const data = await res.json();
                      if (data.success) {
                        alert(language === 'zh-TW' ? '資料庫還原成功！系統即將重新載入。' : 'Restore successful! System will reload.');
                        window.location.reload();
                      } else {
                        alert(`Error: ${data.error}`);
                      }
                    } catch (err: any) {
                      alert('Failed to upload: ' + err.message);
                    }
                    e.target.value = '';
                  }}
                />
              </label>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                {language === 'zh-TW' 
                  ? '* 還原時系統會自動在伺服器產生備份檔。如需手動救援，請聯絡系統管理員。' 
                  : '* System automatically creates a backup during restore.'}
              </p>
            </div>
          </section>
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-100">
          <button 
            onClick={onClose}
            className="w-full py-3 bg-kst-blue text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
          >
            {t('common.common.done')}
          </button>
        </div>
      </div>
    </div>
  );
}
