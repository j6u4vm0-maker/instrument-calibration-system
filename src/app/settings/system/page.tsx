'use client';

import React, { useRef, useState } from 'react';
import { Database, Download, Upload, ShieldCheck, AlertTriangle, FileSpreadsheet, LayoutDashboard, Settings } from 'lucide-react';
import { CSVControls } from '@/components/CSVControls';

export default function SystemSettingsPage() {
  const [isUploadingDb, setIsUploadingDb] = useState(false);
  const dbInputRef = useRef<HTMLInputElement>(null);

  const handleBackupDb = () => {
    // 觸發下載 dev.db
    window.location.href = '/api/system/backup';
  };

  const handleRestoreDbClick = () => {
    if (confirm('警告：還原資料庫將會覆蓋當前系統的所有資料！\n\n建議您在還原前先執行「匯出備份」。\n您確定要繼續嗎？')) {
      dbInputRef.current?.click();
    }
  };

  const handleDbFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.db')) {
      alert('無效的檔案格式，請上傳 .db 備份檔。');
      return;
    }

    setIsUploadingDb(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/system/restore', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.success) {
        alert('系統資料庫還原成功！系統即將重新整理。');
        window.location.reload();
      } else {
        alert(`還原失敗：${data.error}`);
      }
    } catch (error) {
      console.error(error);
      alert('發生未知的錯誤，還原失敗。');
    } finally {
      setIsUploadingDb(false);
      if (dbInputRef.current) {
        dbInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header className="flex items-center gap-4 border-b border-slate-200 pb-6">
        <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center border border-indigo-100">
          <Settings className="w-6 h-6 text-indigo-600" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">備份與維護 (System Maintenance)</h1>
          <p className="text-sm text-slate-500 mt-1">管理系統資料庫備份與各模組 Excel 批次匯出入</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* 全機備份 */}
        <section className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <Database className="w-6 h-6 text-indigo-500" />
            <h2 className="text-lg font-bold text-slate-800">全機資料庫備份 (Full System Backup)</h2>
          </div>
          
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3 text-amber-800 text-sm">
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold">什麼是全機備份？</p>
              <p>這會直接下載/還原系統底層的 SQLite 資料庫檔案 (.db)。包含所有設備、檢具、紀錄與帳號設定，能確保 100% 關聯完整性。</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={handleBackupDb}
              className="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border-2 border-slate-100 hover:border-indigo-500 hover:bg-indigo-50 transition-all group"
            >
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                <Download className="w-5 h-5 text-indigo-600" />
              </div>
              <div className="text-center">
                <p className="font-bold text-slate-700">下載備份</p>
                <p className="text-xs text-slate-500 mt-1">Export Database</p>
              </div>
            </button>

            <button 
              onClick={handleRestoreDbClick}
              disabled={isUploadingDb}
              className="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border-2 border-slate-100 hover:border-red-500 hover:bg-red-50 transition-all group disabled:opacity-50"
            >
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                <Upload className="w-5 h-5 text-red-500" />
              </div>
              <div className="text-center">
                <p className="font-bold text-slate-700">{isUploadingDb ? '還原中...' : '上傳還原'}</p>
                <p className="text-xs text-slate-500 mt-1">Restore Database</p>
              </div>
            </button>
            <input 
              type="file" 
              ref={dbInputRef} 
              onChange={handleDbFileChange}
              accept=".db"
              className="hidden" 
            />
          </div>
        </section>

        {/* 模組 Excel 批次處理 */}
        <section className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <FileSpreadsheet className="w-6 h-6 text-emerald-500" />
            <h2 className="text-lg font-bold text-slate-800">模組 Excel 批次匯出入 (Excel Hub)</h2>
          </div>

          <div className="text-sm text-slate-500">
            針對個別模組進行批次資料的更新。匯入 Excel 時，若系統中已存在相同編號的設備，將會自動更新；若不存在則會新增。
          </div>

          <div className="space-y-4">
            {/* 設備管理 */}
            <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors">
              <div>
                <p className="font-bold text-slate-700">量具設備 (Gages)</p>
                <p className="text-xs text-slate-500">匯出/匯入所有儀器設備主檔</p>
              </div>
              <CSVControls type="gage" />
            </div>

            {/* 檢具管理 */}
            <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors">
              <div>
                <p className="font-bold text-slate-700">檢具清冊 (Fixtures)</p>
                <p className="text-xs text-slate-500">匯出/匯入專用檢具資料</p>
              </div>
              <CSVControls type="fixture" />
            </div>

            {/* 圓棒管理 */}
            <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors">
              <div>
                <p className="font-bold text-slate-700">圓棒清單 (Round Bars)</p>
                <p className="text-xs text-slate-500">匯出/匯入圓棒管理清單</p>
              </div>
              <CSVControls type="round-bar" />
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
