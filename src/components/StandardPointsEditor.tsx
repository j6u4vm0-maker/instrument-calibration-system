"use client";

import { Plus, Trash2 } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface StandardPointsEditorProps {
  pointsList: any[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  onChange: (index: number, field: string, value: string) => void;
  onBlurCategory?: (index: number, value: string) => void;
}

export function StandardPointsEditor({
  pointsList,
  onAdd,
  onRemove,
  onChange,
  onBlurCategory
}: StandardPointsEditorProps) {
  const { t } = useLanguage();

  return (
    <div className="col-span-2 border-y border-slate-100 py-6 my-2 space-y-4">
      <div className="flex justify-between items-center">
        <label className="text-sm font-bold text-slate-800">{t('calibration.cal.default_points')}</label>
        <button 
          type="button"
          onClick={onAdd}
          className="text-xs text-emerald-600 font-bold hover:underline flex items-center gap-1"
        >
          <Plus className="w-3.5 h-3.5" /> {t('calibration.cal.add_item')}
        </button>
      </div>
      
      <div className="space-y-3">
        {pointsList.map((p, idx) => (
          <div key={idx} className="flex items-center gap-3 animate-in fade-in slide-in-from-right-2 duration-300">
            <div className="w-1/3">
              <input 
                type="text"
                value={p.category}
                onChange={(e) => onChange(idx, 'category', e.target.value)}
                onBlur={(e) => onBlurCategory && onBlurCategory(idx, e.target.value)}
                placeholder={t('calibration.cal.item_category')}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
            <div className="flex-1">
              <input 
                type="text"
                value={p.points}
                onChange={(e) => onChange(idx, 'points', e.target.value)}
                placeholder="0, 25, 50..."
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-emerald-500/20 font-mono"
              />
            </div>
            <div className="w-16">
              <input 
                type="text"
                value={p.unit || ""}
                onChange={(e) => onChange(idx, 'unit', e.target.value)}
                placeholder="Unit"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
            <button 
              type="button"
              onClick={() => onRemove(idx)}
              className="p-2 text-slate-300 hover:text-red-500 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
