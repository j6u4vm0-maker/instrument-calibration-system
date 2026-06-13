'use client';

import { useState, useEffect } from "react";
import { 
  Plus, 
  X, 
  ShieldCheck, 
  Save, 
  Trash2,
  Edit2
} from "lucide-react";
import { createStandardAction, updateStandardAction } from "@/app/actions/standard-actions";
import { getCategoriesAction, createCategoryAction } from "@/app/actions/gage-actions";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useRouter } from "next/navigation";
import { SearchableSelect } from "./SearchableSelect";

interface StandardEditorModalProps {
  standard?: any;
}

export default function StandardEditorModal({ standard }: StandardEditorModalProps) {
  const { t } = useLanguage();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [name, setName] = useState(standard?.name || "");
  const [description, setDescription] = useState(standard?.description || "");
  const [defaultPoints, setDefaultPoints] = useState(standard?.defaultPoints || "");
  const [targetCategory, setTargetCategory] = useState(standard?.targetCategory || "");
  const [allCategories, setAllCategories] = useState<string[]>([]);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [type, setType] = useState(standard?.type || "STEPPED");
  const [items, setItems] = useState<any[]>(() => {
    const crits = standard?.criteria || [
      { category: "外徑", rangeStart: 0, rangeEnd: 100, tolerancePlus: 0.02, toleranceMinus: -0.02, unit: "mm" }
    ];
    const pts = standard?.points || [
      { category: "外徑", points: "0, 25, 50, 75, 100", unit: "mm" }
    ];

    const merged: any[] = [];
    const usedPts = new Set<number>();

    crits.forEach((c: any) => {
      const ptIdx = pts.findIndex((p: any, i: number) => !usedPts.has(i) && p.category === c.category);
      let points = "";
      if (ptIdx !== -1) {
        points = pts[ptIdx].points;
        usedPts.add(ptIdx);
      }
      merged.push({ ...c, points });
    });

    pts.forEach((p: any, i: number) => {
      if (!usedPts.has(i)) {
        merged.push({ 
          category: p.category, 
          rangeStart: "", 
          rangeEnd: "", 
          tolerancePlus: "", 
          toleranceMinus: "", 
          unit: p.unit, 
          points: p.points 
        });
      }
    });

    return merged.length > 0 ? merged : [{ category: "", rangeStart: "", rangeEnd: "", tolerancePlus: "", toleranceMinus: "", unit: "", points: "" }];
  });

  const [defaultCycle, setDefaultCycle] = useState<number>(standard?.defaultCycle || 12);
  const [defaultPrecision, setDefaultPrecision] = useState(standard?.defaultPrecision || "");

  useEffect(() => {
    if (isOpen) {
      const loadCategories = async () => {
        const cats = await getCategoriesAction();
        setAllCategories(cats as string[]);
      };
      loadCategories();

      if (standard) {
        setName(standard.name || "");
        setDescription(standard.description || "");
        setDefaultPoints(standard.defaultPoints || "");
        setTargetCategory(standard.targetCategory || "");
        setType(standard.type || "STEPPED");
        
        const crits = standard.criteria || [{ category: "外徑", rangeStart: 0, rangeEnd: 100, tolerancePlus: 0.02, toleranceMinus: -0.02, unit: "mm" }];
        const pts = standard.points || [{ category: "外徑", points: "0, 25, 50, 75, 100", unit: "mm" }];
        const merged: any[] = [];
        const usedPts = new Set<number>();
        crits.forEach((c: any) => {
          const ptIdx = pts.findIndex((p: any, i: number) => !usedPts.has(i) && p.category === c.category);
          let points = "";
          if (ptIdx !== -1) {
            points = pts[ptIdx].points;
            usedPts.add(ptIdx);
          }
          merged.push({ ...c, points });
        });
        pts.forEach((p: any, i: number) => {
          if (!usedPts.has(i)) {
            merged.push({ category: p.category, rangeStart: "", rangeEnd: "", tolerancePlus: "", toleranceMinus: "", unit: p.unit, points: p.points });
          }
        });
        setItems(merged.length > 0 ? merged : [{ category: "", rangeStart: "", rangeEnd: "", tolerancePlus: "", toleranceMinus: "", unit: "", points: "" }]);

        setDefaultCycle(standard.defaultCycle || 12);
        setDefaultPrecision(standard.defaultPrecision || "");
      }
    }
  }, [isOpen, standard]);

  const handleAddItem = () => {
    const last = items[items.length - 1];
    setItems([
      ...items, 
      { 
        category: last ? last.category : "外徑",
        rangeStart: last ? last.rangeEnd : 0, 
        rangeEnd: last ? (parseFloat(last.rangeEnd as string) || 0) + 100 : 100, 
        tolerancePlus: last ? last.tolerancePlus : 0.01, 
        toleranceMinus: last ? last.toleranceMinus : -0.01, 
        unit: last ? last.unit : "mm",
        points: ""
      }
    ]);
  };

  const handleRemoveItem = (idx: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== idx));
  };

  const handleItemChange = (idx: number, field: string, val: any) => {
    const next = [...items];
    next[idx][field] = val;
    setItems(next);
  };

  const precisionDecimals = (() => {
    const numMatch = defaultPrecision.match(/(\d+\.?\d*)/);
    if (!numMatch) return undefined;
    const numStr = numMatch[1];
    return numStr.includes('.') ? numStr.split('.')[1].length : 0;
  })();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const data = { 
      name, 
      description, 
      targetCategory,
      defaultPoints, 
      type, 
      criteria: items.filter(i => i.category || i.rangeStart !== "" || i.tolerancePlus !== "").map(i => ({
        category: i.category,
        rangeStart: parseFloat(i.rangeStart as any) || 0,
        rangeEnd: parseFloat(i.rangeEnd as any) || 0,
        tolerancePlus: Math.abs(parseFloat(i.tolerancePlus as any) || 0),
        toleranceMinus: -Math.abs(parseFloat(i.toleranceMinus as any) || 0),
        unit: i.unit
      })),
      points: items.filter(i => i.category || i.points).map(i => ({
        category: i.category,
        points: i.points,
        unit: i.unit
      })),
      defaultCycle,
      defaultPrecision
    };

    try {
      const res = standard 
        ? await updateStandardAction(standard.id, data)
        : await createStandardAction(data);
        
      if (res.success) {
        setIsOpen(false);
        router.refresh();
      } else {
        alert(res.error || "Save failed");
      }
    } catch (error) {
      console.error(error);
      alert("Error saving standard");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {standard ? (
        <button 
          onClick={() => setIsOpen(true)}
          className="p-2 text-slate-400 hover:text-kst-blue hover:bg-blue-50 rounded-lg transition-all"
        >
          <Edit2 className="w-4 h-4" />
        </button>
      ) : (
        <button 
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-kst-blue text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
        >
          <Plus className="w-4 h-4" />
          <span>{t('calibration.cal.create_standard') || '新增標準'}</span>
        </button>
      )}

      {isOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
            <header className="px-8 py-6 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-kst-blue rounded-xl flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-lg">
                    {standard ? (t('calibration.cal.edit_standard') || '編輯允收標準') : (t('calibration.cal.create_standard') || '建立允收標準')}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">配置自動判定規則與公差範圍</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </header>

            <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700">{t('calibration.cal.standard_name') || '標準名稱'}</label>
                  <input 
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="例如：游標卡尺-外徑允收"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-kst-blue/20 outline-none transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-bold text-slate-700">{t('calibration.cal.bind_category') || '綁定儀器類別'}</label>
                    <button
                      type="button"
                      onClick={() => { setShowAddCategory(v => !v); setNewCategoryName(''); }}
                      className="text-xs text-kst-blue hover:text-blue-700 flex items-center gap-1 font-bold transition-colors"
                    >
                      <span className="text-base leading-none">＋</span> 新增類別
                    </button>
                  </div>
                  {showAddCategory && (
                    <div className="flex gap-2 items-center p-2 bg-blue-50 rounded-xl border border-blue-100">
                      <input
                        autoFocus
                        value={newCategoryName}
                        onChange={e => setNewCategoryName(e.target.value)}
                        onKeyDown={async (e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            if (!newCategoryName.trim()) return;
                            setIsAddingCategory(true);
                            const res = await createCategoryAction(newCategoryName.trim());
                            setIsAddingCategory(false);
                            if (res.success) {
                              setAllCategories(prev => [...prev, newCategoryName.trim()].sort());
                              setTargetCategory(newCategoryName.trim());
                              setNewCategoryName('');
                              setShowAddCategory(false);
                            } else {
                              alert(res.error || '建立失敗');
                            }
                          } else if (e.key === 'Escape') {
                            setShowAddCategory(false);
                          }
                        }}
                        placeholder="輸入新類別名稱…"
                        className="flex-1 px-3 py-1.5 text-sm border border-blue-200 rounded-lg outline-none focus:ring-2 focus:ring-kst-blue/20 bg-white"
                      />
                      <button
                        type="button"
                        disabled={isAddingCategory || !newCategoryName.trim()}
                        onClick={async () => {
                          if (!newCategoryName.trim()) return;
                          setIsAddingCategory(true);
                          const res = await createCategoryAction(newCategoryName.trim());
                          setIsAddingCategory(false);
                          if (res.success) {
                            setAllCategories(prev => [...prev, newCategoryName.trim()].sort());
                            setTargetCategory(newCategoryName.trim());
                            setNewCategoryName('');
                            setShowAddCategory(false);
                          } else {
                            alert(res.error || '建立失敗');
                          }
                        }}
                        className="px-3 py-1.5 text-xs bg-kst-blue text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-all font-bold"
                      >
                        {isAddingCategory ? '…' : '確認'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowAddCategory(false)}
                        className="px-2 py-1.5 text-xs text-slate-500 hover:text-slate-700 transition-colors"
                      >
                        取消
                      </button>
                    </div>
                  )}
                  <SearchableSelect 
                    options={allCategories}
                    value={targetCategory}
                    onChange={(val) => setTargetCategory(val)}
                    placeholder="例如：游標卡尺"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700">{t('calibration.cal.judgment_type') || '判定類型'}</label>
                  <select 
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-kst-blue/20 outline-none transition-all bg-white"
                  >
                    <option value="FIXED">固定值 (Fixed)</option>
                    <option value="STEPPED">分段階梯 (Stepped)</option>
                  </select>
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700 flex justify-between items-center">
                    <span>{t('calibration.gage.cycle') || '校正週期'} <span className="text-[10px] text-slate-400 font-normal">(月)</span></span>
                    <div className="flex gap-1">
                      {[12, 24, 36].map(m => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setDefaultCycle(m)}
                          className={`text-[10px] px-1.5 py-0.5 rounded border transition-all ${
                            defaultCycle === m 
                              ? 'bg-kst-blue text-white border-kst-blue' 
                              : 'bg-white text-slate-500 border-slate-200 hover:border-kst-blue'
                          }`}
                        >
                          {m/12}年
                        </button>
                      ))}
                    </div>
                  </label>
                  <input 
                    required
                    type="number"
                    value={defaultCycle}
                    onChange={(e) => setDefaultCycle(parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-kst-blue/20 outline-none transition-all"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700">預設精度 (Precision)</label>
                  <input 
                    value={defaultPrecision}
                    onChange={(e) => setDefaultPrecision(e.target.value)}
                    placeholder="例如：0.01mm"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-kst-blue/20 outline-none transition-all"
                  />
                </div>
                
                {/* Removed StandardPointsEditor */}

                <div className="col-span-2 space-y-1.5">
                  <label className="text-sm font-bold text-slate-700">{t('calibration.cal.description') || '說明'}</label>
                  <textarea 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={2}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-kst-blue/20 outline-none transition-all resize-none"
                  />
                </div>
              </div>

              {/* Combined Table */}
              <div className="space-y-2 mt-6">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                  <ShieldCheck className="w-4 h-4 text-kst-blue" />
                  <h4 className="text-xs font-black text-kst-blue uppercase tracking-widest">校正與判定設定</h4>
                </div>
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider">
                      <tr>
                        <th className="px-3 py-2.5 border-b border-slate-100 w-32">{t('calibration.gage.category')}</th>
                        <th className="px-3 py-2.5 border-b border-slate-100 w-24">單位</th>
                        <th className="px-3 py-2.5 border-b border-slate-100">標準範圍</th>
                        <th className="px-3 py-2.5 border-b border-slate-100">允收公差</th>
                        <th className="px-3 py-2.5 border-b border-slate-100">預設校正點</th>
                        <th className="px-3 py-2.5 border-b border-slate-100 w-10"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {items.map((item, idx) => (
                        <tr key={idx} className="group hover:bg-slate-50/50 transition-colors">
                          <td className="px-2 py-1.5">
                            <input
                              type="text"
                              value={item.category}
                              onChange={(e) => handleItemChange(idx, 'category', e.target.value)}
                              placeholder="例如：外觀"
                              className="w-full px-2 py-1 bg-transparent hover:bg-slate-50 focus:bg-white focus:ring-1 focus:ring-kst-blue outline-none rounded transition-all font-bold text-slate-700"
                            />
                          </td>
                          <td className="px-2 py-1.5">
                            <input
                              type="text"
                              value={item.unit || ""}
                              onChange={(e) => handleItemChange(idx, 'unit', e.target.value)}
                              placeholder="mm"
                              className="w-full px-2 py-1 bg-transparent hover:bg-slate-50 focus:bg-white focus:ring-1 focus:ring-kst-blue outline-none rounded transition-all text-slate-600"
                            />
                          </td>
                          <td className="px-2 py-1.5">
                            <div className="flex items-center gap-1">
                              <input
                                type="text"
                                value={item.rangeStart}
                                onChange={(e) => handleItemChange(idx, 'rangeStart', e.target.value)}
                                placeholder="0"
                                className="w-12 px-2 py-1 bg-transparent hover:bg-slate-50 focus:bg-white focus:ring-1 focus:ring-kst-blue outline-none rounded transition-all font-mono text-slate-600 text-center"
                              />
                              <span className="text-slate-400">-</span>
                              <input
                                type="text"
                                value={item.rangeEnd}
                                onChange={(e) => handleItemChange(idx, 'rangeEnd', e.target.value)}
                                placeholder="25"
                                className="w-12 px-2 py-1 bg-transparent hover:bg-slate-50 focus:bg-white focus:ring-1 focus:ring-kst-blue outline-none rounded transition-all font-mono text-slate-600 text-center"
                              />
                            </div>
                          </td>
                          <td className="px-2 py-1.5">
                            <div className="flex items-center gap-1">
                              <span className="text-slate-400 font-mono">+</span>
                              <input
                                type="text"
                                value={item.tolerancePlus}
                                onChange={(e) => handleItemChange(idx, 'tolerancePlus', e.target.value)}
                                placeholder="0.01"
                                className="w-14 px-2 py-1 bg-transparent hover:bg-slate-50 focus:bg-white focus:ring-1 focus:ring-kst-blue outline-none rounded transition-all font-mono text-kst-blue font-bold text-center"
                              />
                              <span className="text-slate-400 font-mono">/</span>
                              <input
                                type="text"
                                value={item.toleranceMinus}
                                onChange={(e) => handleItemChange(idx, 'toleranceMinus', e.target.value)}
                                placeholder="-0.01"
                                className="w-14 px-2 py-1 bg-transparent hover:bg-slate-50 focus:bg-white focus:ring-1 focus:ring-kst-blue outline-none rounded transition-all font-mono text-red-500 font-bold text-center"
                              />
                            </div>
                          </td>
                          <td className="px-2 py-1.5">
                            <input
                              type="text"
                              value={item.points}
                              onChange={(e) => handleItemChange(idx, 'points', e.target.value)}
                              placeholder="0, 25, 50"
                              className="w-full px-2 py-1 bg-transparent hover:bg-slate-50 focus:bg-white focus:ring-1 focus:ring-kst-blue outline-none rounded transition-all font-mono text-slate-600"
                            />
                          </td>
                          <td className="px-2 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button type="button" onClick={() => handleRemoveItem(idx)} className="p-1 text-slate-300 hover:text-red-500 transition-colors">
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
                  onClick={handleAddItem}
                  className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-kst-blue hover:text-blue-700 transition-colors px-2 py-1 rounded hover:bg-blue-50"
                >
                  <Plus className="w-3 h-3" /> 新增項目
                </button>
              </div>

              <footer className="pt-6 flex gap-4">
                <button 
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-6 py-3 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all"
                >
                  {t('common.common.cancel')}
                </button>
                {standard && (
                  <button 
                    type="button"
                    onClick={async () => {
                      const linked = standard._count?.gages || 0;
                      if (linked > 0) {
                        alert(`此標準目前正被 ${linked} 台設備使用中，無法刪除。`);
                        return;
                      }
                      if (confirm(`確定要刪除「${standard.name}」嗎？`)) {
                        const res = await (await import('@/app/actions/standard-actions')).deleteStandardAction(standard.id);
                        if (res.success) {
                          setIsOpen(false);
                          router.refresh();
                        }
                      }
                    }}
                    className="px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl transition-all"
                    title="刪除"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
                <button 
                  disabled={isSubmitting}
                  type="submit"
                  className="flex-1 px-6 py-3 bg-kst-blue text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? t('calibration.cal.processing') : (
                    <>
                      <Save className="w-4 h-4" /> {t('common.common.save_changes')}
                    </>
                  )}
                </button>
              </footer>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
