"use client";

import { useState, useEffect } from "react";
import { 
  ArrowUpDown, 
  MapPin, 
  Calendar,
  ExternalLink,
  ChevronDown,
  Check,
  Package,
  Trash2,
  FolderTree,
  FileSignature
} from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { StatusCell } from "@/components/StatusCell";
import { batchDeleteGagesAction } from "@/app/actions/gage-actions";
import { useRouter } from "next/navigation";
import BatchEditModal from "./BatchEditModal";
import GageEditModal from "./GageEditModal";
import { CSVControls } from "./CSVControls";
import CategoryManagementModal from "./CategoryManagementModal";
import { getAllCategoriesAction } from "@/app/actions/category-actions";
import { GageImportExportButtons } from "./GageImportExportButtons";
import CalibrationModal from "./CalibrationModal";


interface GageTableProps {
  gages: any[];
  vendors?: any[];
}

export default function GageTable({ gages, vendors = [] }: GageTableProps) {
  const { t, language } = useLanguage();
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [categories, setCategories] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("ALL");
  const [calibratingGage, setCalibratingGage] = useState<any>(null);

  useEffect(() => {
    const loadCats = async () => {
      const data = await getAllCategoriesAction();
      setCategories(data);
    };
    loadCats();
  }, []);

  const toggleSelectAll = () => {
    if (selectedIds.size === sortedGages.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(sortedGages.map(g => g.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const ALL_COLUMNS = [
    { id: "id", label: t('calibration.gage.id'), alwaysVisible: true },
    { id: "name", label: t('calibration.gage.name'), alwaysVisible: true },
    { id: "category", label: t('calibration.gage.category') },
    { id: "spec", label: t('calibration.gage.spec') },
    { id: "precision", label: t('calibration.gage.precision') },
    { id: "usageRange", label: t('calibration.gage.range') },
    { id: "capacity", label: t('calibration.gage.capacity') },
    { id: "calPoints", label: t('calibration.gage.points') },
    { id: "acceptance", label: t('calibration.gage.acceptance') },
    { id: "tafLogo", label: t('calibration.gage.taf') },
    { id: "manager", label: t('calibration.gage.manager') },
    { id: "calType", label: t('calibration.gage.cal_type') },
    { id: "calibrationCycle", label: t('calibration.gage.cycle') },
    { id: "lastCalDate", label: t('calibration.gage.last_cal') },
    { id: "nextCalDate", label: t('calibration.gage.next_cal') },
    { id: "location", label: t('calibration.gage.location') },
    { id: "status", label: t('common.common.status') },
  ];

  const [visibleColumns, setVisibleColumns] = useState<string[]>(
    ALL_COLUMNS.filter(c => c.alwaysVisible || ["category", "spec", "location", "nextCalDate"].includes(c.id)).map(c => c.id)
  );
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' | null }>({
    key: 'nextCalDate',
    direction: 'asc'
  });

  const toggleColumn = (id: string) => {
    setVisibleColumns(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' | null = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    } else if (sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = null;
    }
    setSortConfig({ key, direction });
  };

  const filteredByTab = activeCategory === "ALL" 
    ? gages 
    : gages.filter(g => g.category === activeCategory);

  const sortedGages = [...filteredByTab].sort((a, b) => {
    if (!sortConfig.key || !sortConfig.direction) return 0;
    
    let aValue = a[sortConfig.key];
    let bValue = b[sortConfig.key];

    // Handle date sorting
    if (sortConfig.key === 'nextCalDate' || sortConfig.key === 'lastCalDate') {
      aValue = new Date(aValue).getTime();
      bValue = new Date(bValue).getTime();
    }

    if (aValue < bValue) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  const handleDeleteSelected = async () => {
    if (!confirm(t('calibration.gage.confirm_del', { id: `${selectedIds.size} ${t('calibration.gage.list')}` }))) return;
    try {
      await batchDeleteGagesAction(Array.from(selectedIds));
      setSelectedIds(new Set());
      router.refresh();
    } catch (error) {
      alert(t('common.common.error_batch'));
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden flex flex-col relative">
      
      {/* Batch Actions Bar */}
      {selectedIds.size > 0 && (
        <div className="sticky top-0 z-40 bg-kst-blue text-white px-6 py-3 flex items-center justify-between animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-4">
            <span className="text-sm font-bold">{t('calibration.batch.selected', { count: selectedIds.size })}</span>
            <div className="h-4 w-px bg-white/20" />
            <button 
              onClick={() => setSelectedIds(new Set())}
              className="text-xs font-medium hover:underline opacity-80"
            >
              {t('common.common.deselect')}
            </button>
          </div>
          <div className="flex gap-2">
            <BatchEditModal 
              selectedIds={Array.from(selectedIds)} 
              onSuccess={() => {
                setSelectedIds(new Set());
                router.refresh();
              }}
            />
            <button 
              onClick={handleDeleteSelected}
              className="px-4 py-2 bg-red-500 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-red-600 transition-all shadow-lg shadow-red-500/20"
            >
              <Trash2 className="w-4 h-4" /> {t('common.common.delete_selected')}
            </button>
          </div>
        </div>
      )}

      {/* Category Tabs & Management */}
      <div className="p-6 pb-0 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => setActiveCategory("ALL")}
            className={`px-5 py-2 rounded-2xl text-xs font-black transition-all ${
              activeCategory === "ALL" 
                ? 'bg-kst-blue text-white shadow-lg shadow-blue-100' 
                : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-100'
            }`}
          >
            {t('common.common.all')}
          </button>
          {categories.map(cat => (
            <button 
              key={cat.id}
              onClick={() => setActiveCategory(cat.name)}
              className={`px-5 py-2 rounded-2xl text-xs font-black transition-all ${
                activeCategory === cat.name 
                  ? 'bg-kst-blue text-white shadow-lg shadow-blue-100' 
                  : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-100'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
        <CategoryManagementModal />
      </div>

      {/* Column Selector */}
      <div className="p-4 border-b border-slate-50 flex justify-end items-center gap-3 relative">
        <GageImportExportButtons gages={gages} />
        <CSVControls
          type="gage"
          itemLabel={t('calibration.gage.list')}
          uploadLabel={`${t('common.common.upload')} ${t('calibration.gage.list')}`}
          downloadLabel={`${t('common.common.download')} ${t('calibration.gage.list')}`}
          uploadTitle={`${t('common.common.upload')} ${t('calibration.gage.list')}`}
          downloadTitle={`${t('common.common.download')} ${t('calibration.gage.list')}`}
        />
        <div className="h-6 w-px bg-slate-200 mx-1" />
        <button 
          onClick={() => setIsSelectorOpen(!isSelectorOpen)}
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg border border-slate-200 transition-all"
        >
          <ChevronDown className={`w-4 h-4 transition-transform ${isSelectorOpen ? 'rotate-180' : ''}`} />
          {t('calibration.gage.customize_header')}
        </button>

        {isSelectorOpen && (
          <div className="absolute right-4 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 z-30 p-2 animate-in fade-in slide-in-from-top-2">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 py-2">{t('calibration.gage.display_fields')}</div>
            <div className="max-h-64 overflow-y-auto">
              {ALL_COLUMNS.map(col => (
                <button
                  key={col.id}
                  onClick={() => toggleColumn(col.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors ${
                    visibleColumns.includes(col.id) 
                      ? 'text-kst-blue bg-blue-50/50' 
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {col.label}
                  {visibleColumns.includes(col.id) && <Check className="w-4 h-4" />}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm table-fixed">
          <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 w-10">
                <input 
                  type="checkbox" 
                  className="rounded border-slate-300 text-kst-blue focus:ring-kst-blue"
                  checked={selectedIds.size === sortedGages.length && sortedGages.length > 0}
                  onChange={toggleSelectAll}
                />
              </th>
              {ALL_COLUMNS.filter(c => visibleColumns.includes(c.id)).map(col => (
                <th 
                  key={col.id} 
                  className={`px-6 py-4 ${(col.id === 'nextCalDate' || col.id === 'id') ? 'cursor-pointer hover:bg-slate-100 transition-colors' : ''}`}
                  onClick={() => (col.id === 'nextCalDate' || col.id === 'id') && requestSort(col.id)}
                >
                  <div className="flex items-center gap-1">
                    {col.label}
                    {(col.id === 'nextCalDate' || col.id === 'id') && (
                      <ArrowUpDown className={`w-3 h-3 transition-colors ${
                        sortConfig.key === col.id && sortConfig.direction ? 'text-kst-blue opacity-100' : 'opacity-30'
                      }`} />
                    )}
                  </div>
                </th>
              ))}
              <th className="px-6 py-4 text-right w-24">{t('common.common.actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {sortedGages.length > 0 ? (
              sortedGages.map((gage) => (
                <tr 
                  key={gage.id} 
                  className={`group hover:bg-slate-50/50 transition-colors ${selectedIds.has(gage.id) ? 'bg-blue-50/30' : ''}`}
                >
                  <td className="px-6 py-4">
                    <input 
                      type="checkbox" 
                      className="rounded border-slate-300 text-kst-blue focus:ring-kst-blue"
                      checked={selectedIds.has(gage.id)}
                      onChange={() => toggleSelect(gage.id)}
                    />
                  </td>
                  {visibleColumns.includes("id") && (
                    <td className="px-6 py-4 font-mono font-bold text-kst-blue truncate" title={gage.id}>{gage.id}</td>
                  )}
                  {visibleColumns.includes("name") && (
                    <td className="px-6 py-4 font-medium text-slate-800 truncate" title={gage.name}>{gage.name}</td>
                  )}
                  {visibleColumns.includes("category") && (
                    <td className="px-6 py-4 truncate" title={gage.category}>
                      <span className="text-slate-600 bg-slate-100 px-2 py-0.5 rounded text-xs">{gage.category}</span>
                    </td>
                  )}
                  {visibleColumns.includes("spec") && (
                    <td className="px-6 py-4 text-slate-600 truncate" title={gage.spec || '-'}>{gage.spec || '-'}</td>
                  )}
                  {visibleColumns.includes("precision") && (
                    <td className="px-6 py-4 text-slate-500 truncate" title={gage.precision || '-'}>{gage.precision || '-'}</td>
                  )}
                  {visibleColumns.includes("usageRange") && (
                    <td className="px-6 py-4 text-slate-500 truncate" title={gage.usageRange || '-'}>{gage.usageRange || '-'}</td>
                  )}
                  {visibleColumns.includes("capacity") && (
                    <td className="px-6 py-4 text-slate-500 truncate" title={gage.capacity || '-'}>{gage.capacity || '-'}</td>
                  )}
                  {visibleColumns.includes("calPoints") && (
                    <td className="px-6 py-4 text-slate-500 truncate" title={gage.calPoints || '-'}>{gage.calPoints || '-'}</td>
                  )}
                  {visibleColumns.includes("acceptance") && (
                    <td className="px-6 py-4 text-slate-500 truncate" title={gage.acceptance || '-'}>{gage.acceptance || '-'}</td>
                  )}
                  {visibleColumns.includes("tafLogo") && (
                    <td className="px-6 py-4 text-slate-500 truncate" title={gage.tafLogo || '-'}>{gage.tafLogo || '-'}</td>
                  )}
                  {visibleColumns.includes("manager") && (
                    <td className="px-6 py-4 text-slate-600 truncate" title={gage.manager || '-'}>{gage.manager || '-'}</td>
                  )}
                  {visibleColumns.includes("calType") && (
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                        gage.calType === '免校正' 
                          ? 'bg-slate-100 text-slate-500' 
                          : 'bg-blue-50 text-kst-blue'
                      }`}>
                        {gage.calType === '免校正' ? t('common.common.not_required') : (gage.calType || '-')}
                      </span>
                    </td>
                  )}
                  {visibleColumns.includes("calibrationCycle") && (
                    <td className="px-6 py-4 text-slate-500 truncate" title={gage.calibrationCycle?.toString()}>{gage.calibrationCycle}</td>
                  )}
                  {visibleColumns.includes("lastCalDate") && (
                    <td className="px-6 py-4 text-slate-600">{new Date(gage.lastCalDate).toLocaleDateString(language === 'zh' ? 'zh-TW' : 'en-US')}</td>
                  )}
                  {visibleColumns.includes("nextCalDate") && (
                    <td className="px-6 py-4">
                      {gage.calculatedStatus === 'NO_CAL' ? (
                        <span className="text-slate-300 font-bold italic tracking-widest text-[10px]">{t('common.common.no_cal_needed')}</span>
                      ) : (
                        <div className="flex items-center gap-2 text-slate-700 font-medium">
                          <Calendar className="w-4 h-4 text-slate-300" />
                          {new Date(gage.nextCalDate).toLocaleDateString(language === 'zh' ? 'zh-TW' : 'en-US')}
                        </div>
                      )}
                    </td>
                  )}
                  {visibleColumns.includes("location") && (
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <MapPin className="w-4 h-4 text-slate-300" />
                        {gage.location === 'India' ? t('calibration.gage.india') : t('calibration.gage.taiwan')}
                      </div>
                    </td>
                  )}
                  {visibleColumns.includes("status") && (
                    <td className="px-6 py-4 text-center">
                      <StatusCell 
                        id={gage.id} 
                        status={gage.status} 
                        calculatedStatus={gage.calculatedStatus} 
                      />
                    </td>
                  )}
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link 
                        href={`/gages/${encodeURIComponent(gage.id)}`}
                        className="p-2 text-slate-400 hover:text-kst-blue hover:bg-blue-50 rounded-lg transition-all"
                        title={t('common.common.details')}
                      >
                        <ExternalLink className="w-5 h-5" />
                      </Link>
                      
                      <button 
                        onClick={() => setCalibratingGage(gage)}
                        className="p-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-all"
                        title={t('calibration.cal.register_report')}
                      >
                        <FileSignature className="w-5 h-5" />
                      </button>

                      <GageEditModal gage={gage} />

                      <button 
                        onClick={async () => {
                          if (confirm(t('calibration.gage.confirm_del', { id: gage.id }))) {
                            try {
                              await batchDeleteGagesAction([gage.id]);
                              router.refresh();
                            } catch (e) {
                              alert(t('common.common.error_batch'));
                            }
                          }
                        }}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        title={t('calibration.gage.delete')}
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>

                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={20} className="px-6 py-20 text-center text-slate-400">{t('common.common.no_data')}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {calibratingGage && (
        <CalibrationModal
          isOpenExternal={true}
          gageId={calibratingGage.id}
          calPoints={calibratingGage.calPoints || ""}
          acceptance={calibratingGage.acceptance || ""}
          calibrationCycle={calibratingGage.calibrationCycle}
          acceptanceStandard={calibratingGage.acceptanceStandard}
          vendors={vendors}
          onClose={() => setCalibratingGage(null)}
        />
      )}
    </div>
  );
}
