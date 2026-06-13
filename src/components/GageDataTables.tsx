"use client";

import { useLanguage } from "@/lib/i18n/LanguageContext";
import { Plus, Trash2 } from "lucide-react";

interface CriteriaItem {
  category: string;
  range: string;
  tolerance: string;
}

interface PointItem {
  category: string;
  points: string;
  unit?: string;
}

export function CriteriaTable({ text }: { text: string }) {
  const { t } = useLanguage();
  
  const parseCriteria = (input: string): CriteriaItem[] => {
    if (!input) return [];
    return input.split('\n').filter(line => line.trim()).map(line => {
      const parts_colon = line.split(':');
      const left = (parts_colon[0] || "").trim();
      const right = (parts_colon[1] || "").trim();
      
      if (!left && !right) return { category: line, range: "", tolerance: "" };
      
      // Smart split: Try to find the range at the end. 
      // If the left part has spaces, we assume the last segment is the range 
      // ONLY IF it looks like a range (starts with digit or has ~ or - or unit)
      const parts = left.split(' ');
      if (parts.length === 1) {
        return { category: parts[0], range: "", tolerance: right };
      }
      
      const lastPart = parts[parts.length - 1];
      const isRange = /[\d~]/.test(lastPart) || lastPart.toLowerCase().includes('mm') || lastPart.toLowerCase().includes('inch');
      
      if (isRange) {
        return { 
          category: parts.slice(0, -1).join(' ').trim(), 
          range: lastPart, 
          tolerance: right 
        };
      } else {
        return { category: left, range: "", tolerance: right };
      }
    });
  };

  const items = parseCriteria(text);
  if (items.length === 0) return <span className="text-slate-400">-</span>;

  return (
    <div className="overflow-hidden rounded-xl border border-slate-100 bg-white">
      <table className="w-full text-left text-xs">
        <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider">
          <tr>
            <th className="px-3 py-2 border-b border-slate-100">{t('calibration.gage.category')}</th>
            <th className="px-3 py-2 border-b border-slate-100">{t('calibration.cal.std.range')}</th>
            <th className="px-3 py-2 border-b border-slate-100">{t('calibration.cal.std.tolerance')}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {items.map((item, idx) => (
            <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
              <td className="px-3 py-2 font-bold text-slate-700">{item.category}</td>
              <td className="px-3 py-2 font-mono text-slate-600">{item.range}</td>
              <td className="px-3 py-2 font-mono text-kst-blue font-bold">{item.tolerance}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function PointsTable({ text }: { text: string }) {
  const { t } = useLanguage();

  const parsePoints = (input: string): PointItem[] => {
    if (!input) return [];
    return input.split('\n').filter(line => line.trim()).map(line => {
      const [categoryStr, ...pointsParts] = line.split(':');
      let category = (categoryStr || "").trim();
      let points = pointsParts.join(':').trim() || line;
      let unit = "";

      const unitMatch = category.match(/^(.*?)\((.*?)\)$/);
      if (unitMatch) {
        category = unitMatch[1].trim();
        unit = unitMatch[2].trim();
      }
      return { category, points, unit };
    });
  };

  const items = parsePoints(text);
  if (items.length === 0) return <span className="text-slate-400">-</span>;

  return (
    <div className="overflow-hidden rounded-xl border border-slate-100 bg-white">
      <table className="w-full text-left text-xs">
        <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider">
          <tr>
            <th className="px-3 py-2 border-b border-slate-100">{t('calibration.gage.category')}</th>
            <th className="px-3 py-2 border-b border-slate-100 w-24">單位</th>
            <th className="px-3 py-2 border-b border-slate-100">{t('calibration.gage.points')}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {items.map((item, idx) => (
            <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
              <td className="px-3 py-2 font-bold text-slate-700 w-24">{item.category}</td>
              <td className="px-3 py-2 font-bold text-slate-500 w-24">{item.unit || '-'}</td>
              <td className="px-3 py-2 font-mono text-slate-600 break-all">{item.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// --- 編輯器組件 ---

export function CriteriaEditor({ value, onChange }: { value: string, onChange: (val: string) => void }) {
  const { t } = useLanguage();
  
  const items: CriteriaItem[] = value.split('\n').filter(line => line.trim()).map(line => {
    const parts_colon = line.split(':');
    const left = (parts_colon[0] || "").trim();
    const right = (parts_colon[1] || "").trim();
    
    if (!left && !right) return { category: line, range: "", tolerance: "" };
    
    const parts = left.split(' ');
    if (parts.length === 1) return { category: parts[0], range: "", tolerance: right };
    
    const lastPart = parts[parts.length - 1];
    const isRange = /[\d~]/.test(lastPart) || lastPart.toLowerCase().includes('mm') || lastPart.toLowerCase().includes('inch');
    
    if (isRange) {
      return { 
        category: parts.slice(0, -1).join(' ').trim(), 
        range: lastPart, 
        tolerance: right 
      };
    } else {
      return { category: left, range: "", tolerance: right };
    }
  });

  const updateItems = (newItems: CriteriaItem[]) => {
    const str = newItems.map(item => {
      const cat = item.category;
      const ran = item.range;
      return `${cat}${ran ? ' ' + ran : ''}: ${item.tolerance}`;
    }).join('\n');
    onChange(str);
  };

  const handleChange = (idx: number, field: keyof CriteriaItem, val: string) => {
    const newItems = [...items];
    newItems[idx] = { ...newItems[idx], [field]: val };
    updateItems(newItems);
  };

  const addRow = () => {
    updateItems([...items, { category: "", range: "", tolerance: "" }]);
  };

  const removeRow = (idx: number) => {
    updateItems(items.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-2">
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider">
            <tr>
              <th className="px-3 py-2.5 border-b border-slate-100">{t('calibration.gage.category')}</th>
              <th className="px-3 py-2.5 border-b border-slate-100">{t('calibration.cal.std.range')}</th>
              <th className="px-3 py-2.5 border-b border-slate-100">{t('calibration.cal.std.tolerance')}</th>
              <th className="px-3 py-2.5 border-b border-slate-100 w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((item, idx) => (
              <tr key={idx} className="group">
                <td className="px-2 py-1.5">
                  <input 
                    type="text" 
                    value={item.category} 
                    onChange={(e) => handleChange(idx, 'category', e.target.value)}
                    placeholder="例如：外徑"
                    className="w-full px-2 py-1 bg-transparent hover:bg-slate-50 focus:bg-white focus:ring-1 focus:ring-kst-blue outline-none rounded transition-all font-bold text-slate-700"
                  />
                </td>
                <td className="px-2 py-1.5">
                  <input 
                    type="text" 
                    value={item.range} 
                    onChange={(e) => handleChange(idx, 'range', e.target.value)}
                    placeholder="0-25mm"
                    className="w-full px-2 py-1 bg-transparent hover:bg-slate-50 focus:bg-white focus:ring-1 focus:ring-kst-blue outline-none rounded transition-all font-mono text-slate-600"
                  />
                </td>
                <td className="px-2 py-1.5">
                  <input 
                    type="text" 
                    value={item.tolerance} 
                    onChange={(e) => handleChange(idx, 'tolerance', e.target.value)}
                    placeholder="+0.01/-0.01"
                    className="w-full px-2 py-1 bg-transparent hover:bg-slate-50 focus:bg-white focus:ring-1 focus:ring-kst-blue outline-none rounded transition-all font-mono text-kst-blue font-bold"
                  />
                </td>
                <td className="px-2 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button type="button" onClick={() => removeRow(idx)} className="p-1 text-slate-300 hover:text-red-500 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button 
        type="button" 
        onClick={addRow}
        className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-kst-blue hover:text-blue-700 transition-colors px-2 py-1 rounded hover:bg-blue-50"
      >
        <Plus className="w-3 h-3" /> {t('calibration.cal.add_range')}
      </button>
    </div>
  );
}

export function PointsEditor({ value, onChange }: { value: string, onChange: (val: string) => void }) {
  const { t } = useLanguage();

  const parsePoints = (input: string): PointItem[] => {
    if (!input) return [];
    return input.split('\n').filter(line => line.trim()).map(line => {
      const [categoryStr, ...pointsParts] = line.split(':');
      let category = (categoryStr || "").trim();
      let points = pointsParts.join(':').trim();
      let unit = "";

      const unitMatch = category.match(/^(.*?)\((.*?)\)$/);
      if (unitMatch) {
        category = unitMatch[1].trim();
        unit = unitMatch[2].trim();
      }
      return { category, points, unit };
    });
  };

  const items: PointItem[] = parsePoints(value);

  const updateItems = (newItems: PointItem[]) => {
    const str = newItems.map(item => {
      const cat = item.category.trim();
      const unitStr = item.unit?.trim() ? `(${item.unit.trim()})` : '';
      const pts = item.points.trim();
      return `${cat}${unitStr}${pts ? ': ' + pts : ':'}`;
    }).join('\n');
    onChange(str);
  };

  const handleChange = (idx: number, field: keyof PointItem, val: string) => {
    const newItems = [...items];
    newItems[idx] = { ...newItems[idx], [field]: val };
    updateItems(newItems);
  };

  const addRow = () => {
    updateItems([...items, { category: "", points: "", unit: "" }]);
  };

  const removeRow = (idx: number) => {
    updateItems(items.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-2">
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider">
            <tr>
              <th className="px-3 py-2.5 border-b border-slate-100 w-32">{t('calibration.gage.category')}</th>
              <th className="px-3 py-2.5 border-b border-slate-100 w-24">單位</th>
              <th className="px-3 py-2.5 border-b border-slate-100">{t('calibration.gage.points')}</th>
              <th className="px-3 py-2.5 border-b border-slate-100 w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((item, idx) => (
              <tr key={idx} className="group">
                <td className="px-2 py-1.5">
                  <input 
                    type="text" 
                    value={item.category} 
                    onChange={(e) => handleChange(idx, 'category', e.target.value)}
                    placeholder="例如：外徑"
                    className="w-full px-2 py-1 bg-transparent hover:bg-slate-50 focus:bg-white focus:ring-1 focus:ring-kst-blue outline-none rounded transition-all font-bold text-slate-700"
                  />
                </td>
                <td className="px-2 py-1.5">
                  <input 
                    type="text" 
                    value={item.unit || ""} 
                    onChange={(e) => handleChange(idx, 'unit', e.target.value)}
                    placeholder="例如：mm"
                    className="w-full px-2 py-1 bg-transparent hover:bg-slate-50 focus:bg-white focus:ring-1 focus:ring-kst-blue outline-none rounded transition-all font-bold text-slate-500"
                  />
                </td>
                <td className="px-2 py-1.5">
                  <input 
                    type="text" 
                    value={item.points} 
                    onChange={(e) => handleChange(idx, 'points', e.target.value)}
                    placeholder="0, 25, 50, 75, 100"
                    className="w-full px-2 py-1 bg-transparent hover:bg-slate-50 focus:bg-white focus:ring-1 focus:ring-kst-blue outline-none rounded transition-all font-mono text-slate-600"
                  />
                </td>
                <td className="px-2 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button type="button" onClick={() => removeRow(idx)} className="p-1 text-slate-300 hover:text-red-500 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button 
        type="button" 
        onClick={addRow}
        className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-kst-blue hover:text-blue-700 transition-colors px-2 py-1 rounded hover:bg-blue-50"
      >
        <Plus className="w-3 h-3" /> {t('calibration.cal.add_item')}
      </button>
    </div>
  );
}
