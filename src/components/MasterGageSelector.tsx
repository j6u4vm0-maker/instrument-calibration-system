"use client";

import { useState } from "react";
import { X, Search, CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface MasterGageSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  masterGages: any[];
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
}

export function MasterGageSelector({
  isOpen,
  onClose,
  masterGages,
  selectedIds,
  onSelectionChange
}: MasterGageSelectorProps) {
  const { t } = useLanguage();
  const [search, setSearch] = useState("");

  if (!isOpen) return null;

  const filtered = masterGages.filter(g => 
    g.id.toLowerCase().includes(search.toLowerCase()) ||
    g.name.toLowerCase().includes(search.toLowerCase())
  );

  const toggleSelection = (id: string) => {
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter(i => i !== id));
    } else {
      onSelectionChange([...selectedIds, id]);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[70vh]">
        <header className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
          <h5 className="font-bold text-slate-800">{t('calibration.cal.add_master')}</h5>
          <button onClick={onClose}><X className="w-5 h-5 text-slate-400" /></button>
        </header>
        <div className="p-4 bg-slate-50 border-b border-slate-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text"
              placeholder={t('common.common.search_placeholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-kst-blue/5 outline-none"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {filtered.map(g => (
            <button
              key={g.id}
              onClick={() => toggleSelection(g.id)}
              className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between ${
                selectedIds.includes(g.id)
                  ? 'bg-emerald-50 border-emerald-200 ring-2 ring-emerald-500/10'
                  : 'bg-white border-slate-100 hover:border-slate-200'
              }`}
            >
              <div>
                <div className="text-sm font-bold text-slate-800">{g.id}</div>
                <div className="text-[10px] text-slate-500">{g.name}</div>
              </div>
              {selectedIds.includes(g.id) && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-8 text-slate-400 text-sm">
              {t('calibration.cal.no_matching_gage')}
            </div>
          )}
        </div>
        <footer className="p-4 border-t border-slate-100 bg-slate-50">
          <button 
            onClick={onClose}
            className="w-full py-3 bg-kst-blue text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/20"
          >
            {t('common.common.confirm')}
          </button>
        </footer>
      </div>
    </div>
  );
}
