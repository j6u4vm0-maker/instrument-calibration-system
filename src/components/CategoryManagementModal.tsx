"use client";

import { useState, useEffect } from "react";
import { X, Plus, Trash2, Edit2, Check, Settings2, FolderTree, AlertCircle } from "lucide-react";
import { 
  getAllCategoriesAction, 
  createCategoryAction, 
  updateCategoryAction, 
  deleteCategoryAction,
  seedCategoriesAction
} from "@/app/actions/category-actions";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function CategoryManagementModal({ type = "gage" }: { type?: "gage" | "fixture" }) {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [newName, setNewName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadCategories();
    }
  }, [isOpen]);

  const loadCategories = async () => {
    setIsLoading(true);
    const data = await getAllCategoriesAction();
    setCategories(data);
    setIsLoading(false);
  };

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setIsLoading(true);
    await createCategoryAction(newName.trim());
    setNewName("");
    await loadCategories();
  };

  const handleUpdate = async (id: string) => {
    if (!editName.trim()) return;
    setIsLoading(true);
    await updateCategoryAction(id, editName.trim());
    setIsEditing(null);
    await loadCategories();
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('common.common.confirm_delete') || "Are you sure?")) return;
    setIsLoading(true);
    await deleteCategoryAction(id);
    await loadCategories();
  };

  const handleSeed = async () => {
    setIsLoading(true);
    await seedCategoriesAction();
    await loadCategories();
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all text-slate-500 hover:text-kst-blue flex items-center gap-2 group shadow-sm"
        title="Manage Categories"
      >
        <FolderTree className="w-4 h-4 group-hover:scale-110 transition-transform" />
        <span className="text-sm font-bold">{t('calibration.gage.category_manage') || "管理類別"}</span>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
        <header className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-kst-blue/10 rounded-2xl">
              <FolderTree className="w-5 h-5 text-kst-blue" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-800 tracking-tight">{t('calibration.gage.category_manage')}</h2>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">{t('calibration.gage.category_desc')}</p>
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400"
          >
            <X className="w-6 h-6" />
          </button>
        </header>

        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Quick Seed Button */}
          {categories.length === 0 && (
            <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-amber-800">{t('calibration.gage.seed_title')}</p>
                <p className="text-xs text-amber-600 mt-1">{t('calibration.gage.seed_desc')}</p>
                <button 
                  onClick={handleSeed}
                  disabled={isLoading}
                  className="mt-3 px-4 py-2 bg-amber-500 text-white rounded-xl text-xs font-black hover:bg-amber-600 transition-all shadow-lg shadow-amber-200/50"
                >
                  {t('calibration.gage.seed_button')}
                </button>
              </div>
            </div>
          )}

          {/* Add New Category */}
          <div className="flex gap-2">
            <input 
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder={t('calibration.gage.category_placeholder')}
              className="flex-1 px-4 py-3 border border-slate-200 rounded-2xl text-sm focus:ring-4 focus:ring-kst-blue/10 outline-none transition-all font-bold"
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            />
            <button 
              onClick={handleCreate}
              disabled={isLoading || !newName.trim()}
              className="px-6 py-3 bg-kst-blue text-white rounded-2xl text-sm font-black hover:bg-blue-600 transition-all shadow-lg shadow-blue-100 disabled:opacity-50 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> {t('common.common.add')}
            </button>
          </div>

          {/* Category List */}
          <div className="space-y-2 pb-4">
            <label className="text-[10px] text-slate-400 font-black uppercase tracking-widest px-1">
              {t('calibration.gage.category_list')} ({categories.length})
            </label>
            <div className="space-y-2">
              {categories.map((cat) => (
                <div 
                  key={cat.id} 
                  className="group flex items-center justify-between p-4 bg-slate-50 hover:bg-white border border-transparent hover:border-slate-100 rounded-2xl transition-all shadow-sm hover:shadow-md"
                >
                  {isEditing === cat.id ? (
                    <div className="flex-1 flex gap-2">
                      <input 
                        autoFocus
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="flex-1 px-3 py-1.5 border border-kst-blue rounded-xl text-sm outline-none font-bold"
                        onKeyDown={(e) => e.key === 'Enter' && handleUpdate(cat.id)}
                      />
                      <button 
                        onClick={() => handleUpdate(cat.id)}
                        className="p-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => setIsEditing(null)}
                        className="p-2 bg-slate-200 text-slate-600 rounded-xl hover:bg-slate-300"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-3">
                        <span className="font-black text-slate-700">{cat.name}</span>
                        <span className="px-2 py-0.5 bg-slate-200 text-slate-500 text-[10px] font-black rounded-full">
                          {type === "fixture" ? (cat.fixtureCount ?? 0) : (cat.gageCount ?? cat._count?.gages ?? 0)}{" "}
                          {type === "fixture" ? "檢具" : t('calibration.gage.instrument_count')}
                        </span>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => {
                            setIsEditing(cat.id);
                            setEditName(cat.name);
                          }}
                          className="p-2 text-slate-400 hover:text-kst-blue hover:bg-blue-50 rounded-xl transition-all"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(cat.id)}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
              {categories.length === 0 && !isLoading && (
                <div className="text-center py-12 text-slate-400">
                  <FolderTree className="w-12 h-12 mx-auto opacity-10 mb-4" />
                  <p className="text-sm font-bold">目前尚無類別</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
