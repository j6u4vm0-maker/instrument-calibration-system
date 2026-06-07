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
import { batchDeleteFixturesAction } from "@/app/actions/fixture-actions";
import { useRouter } from "next/navigation";
import BatchEditModal from "./BatchEditModal";
import FixtureEditModal from "./FixtureEditModal";
import { CSVControls } from "./CSVControls";
import CategoryManagementModal from "./CategoryManagementModal";
import { getAllCategoriesAction } from "@/app/actions/category-actions";
import CalibrationModal from "./CalibrationModal";
import { formatLocaleDate } from "@/lib/date-format";


interface FixtureTableProps {
  fixtures: any[];
  vendors?: any[];
}

export default function FixtureTable({ fixtures, vendors = [] }: FixtureTableProps) {
  const { t, language } = useLanguage();
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [categories, setCategories] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("ALL");
  const [calibratingFixture, setCalibratingFixture] = useState<any>(null);

  useEffect(() => {
    const loadCats = async () => {
      const data = await getAllCategoriesAction();
      setCategories(data);
    };
    loadCats();
  }, []);

  const toggleSelectAll = () => {
    if (selectedIds.size === sortedFixtures.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(sortedFixtures.map(g => g.id)));
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
    { id: "id", label: t('calibration.fixture.id'), alwaysVisible: true },
    { id: "name", label: t('calibration.fixture.name'), alwaysVisible: true },
    { id: "category", label: t('calibration.fixture.category') },
    { id: "spec", label: t('calibration.fixture.spec') },
    { id: "precision", label: t('calibration.fixture.precision') },
    { id: "usageRange", label: t('calibration.fixture.range') || '使用範圍' },
    { id: "capacity", label: t('calibration.fixture.capacity') || '設備能力範圍' },
    { id: "calPoints", label: t('calibration.fixture.points') },
    { id: "acceptance", label: t('calibration.fixture.acceptance') },
    { id: "tafLogo", label: t('calibration.fixture.taf') },
    { id: "manager", label: t('calibration.fixture.manager') },
    { id: "calType", label: t('calibration.fixture.cal_type') },
    { id: "calibrationCycle", label: t('calibration.fixture.cycle') },
    { id: "lastCalDate", label: t('calibration.fixture.last_cal') },
    { id: "nextCalDate", label: t('calibration.fixture.next_cal') },
    { id: "location", label: t('calibration.fixture.location') },
    { id: "status", label: t('common.common.status') },
  ];

  const [visibleColumns, setVisibleColumns] = useState<string[]>(
    ALL_COLUMNS.filter(c => c.alwaysVisible || ["category", "spec", "location", "nextCalDate"].includes(c.id)).map(c => c.id)
  );
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [isStatusFilterOpen, setIsStatusFilterOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' | null }>({
    key: 'nextCalDate',
    direction: 'asc'
  });
  const statusOptions = [
    { id: 'IN_USE', label: t('common.status.in_use') || '使用中' },
    { id: 'SUSPENDED', label: t('common.status.suspended') || '暫停使用' },
    { id: 'SCRAPPED', label: t('common.status.scrapped') || '報廢' },
  ];
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(statusOptions.map(option => option.id));

  const toggleColumn = (id: string) => {
    setVisibleColumns(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const toggleStatus = (statusId: string) => {
    setSelectedStatuses(prev =>
      prev.includes(statusId) ? prev.filter(id => id !== statusId) : [...prev, statusId]
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
    ? fixtures 
    : fixtures.filter(g => g.category === activeCategory);

  const filteredFixtures = filteredByTab.filter(fixture => selectedStatuses.includes(fixture.status));

  const sortedFixtures = [...filteredFixtures].sort((a, b) => {
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
    if (!confirm(t('calibration.fixture.confirm_del', { id: `${selectedIds.size} ${t('calibration.fixture.list')}` }))) return;
    try {
      await batchDeleteFixturesAction(Array.from(selectedIds));
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
              type="fixture"
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

      {/* All fixtures are '檢具' - show simple header */}
      <div className="p-6 pb-0 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex flex-wrap gap-2">
          <span className="px-5 py-2 rounded-2xl text-xs font-black bg-kst-blue text-white shadow-lg shadow-blue-100">
            {t('common.common.all')}
          </span>
        </div>
        <CategoryManagementModal type="fixture" />
      </div>

      {/* Column Selector */}
      <div className="p-4 border-b border-slate-50 flex justify-end items-center gap-3 relative">
        <CSVControls
          type="fixture"
          itemLabel="檢具清單"
          uploadLabel="上傳 檢具清單"
          downloadLabel="下載 檢具清單"
          uploadTitle="上傳 檢具清單"
          downloadTitle="下載 檢具清單"
        />
        <button
          onClick={() => setIsStatusFilterOpen(!isStatusFilterOpen)}
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg border border-slate-200 transition-all"
        >
          <ChevronDown className={`w-4 h-4 transition-transform ${isStatusFilterOpen ? 'rotate-180' : ''}`} />
          狀態篩選
        </button>
        <div className="h-6 w-px bg-slate-200 mx-1" />
        <button 
          onClick={() => setIsSelectorOpen(!isSelectorOpen)}
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg border border-slate-200 transition-all"
        >
          <ChevronDown className={`w-4 h-4 transition-transform ${isSelectorOpen ? 'rotate-180' : ''}`} />
          {t('calibration.fixture.customize_header')}
        </button>

        {isStatusFilterOpen && (
          <div className="absolute right-56 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 z-30 p-2 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center justify-between px-3 py-2">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">狀態篩選</div>
              <button
                onClick={() => setSelectedStatuses(statusOptions.map(option => option.id))}
                className="text-[10px] font-bold text-kst-blue hover:underline"
              >
                全選
              </button>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {statusOptions.map(option => (
                <button
                  key={option.id}
                  onClick={() => toggleStatus(option.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors ${
                    selectedStatuses.includes(option.id)
                      ? 'text-kst-blue bg-blue-50/50'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {option.label}
                  {selectedStatuses.includes(option.id) && <Check className="w-4 h-4" />}
                </button>
              ))}
            </div>
          </div>
        )}

        {isSelectorOpen && (
          <div className="absolute right-4 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 z-30 p-2 animate-in fade-in slide-in-from-top-2">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 py-2">{t('calibration.fixture.display_fields')}</div>
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
                  checked={selectedIds.size === sortedFixtures.length && sortedFixtures.length > 0}
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
            {sortedFixtures.length > 0 ? (
              sortedFixtures.map((fixture) => (
                <tr 
                  key={fixture.id} 
                  className={`group hover:bg-slate-50/50 transition-colors ${selectedIds.has(fixture.id) ? 'bg-blue-50/30' : ''}`}
                >
                  <td className="px-6 py-4">
                    <input 
                      type="checkbox" 
                      className="rounded border-slate-300 text-kst-blue focus:ring-kst-blue"
                      checked={selectedIds.has(fixture.id)}
                      onChange={() => toggleSelect(fixture.id)}
                    />
                  </td>
                  {visibleColumns.includes("id") && (
                    <td className="px-6 py-4 font-mono font-bold text-kst-blue truncate" title={fixture.id}>{fixture.id}</td>
                  )}
                  {visibleColumns.includes("name") && (
                    <td className="px-6 py-4 font-medium text-slate-800 truncate" title={fixture.name}>{fixture.name}</td>
                  )}
                  {visibleColumns.includes("category") && (
                    <td className="px-6 py-4 truncate" title={fixture.category}>
                      <span className="text-slate-600 bg-slate-100 px-2 py-0.5 rounded text-xs">{fixture.category}</span>
                    </td>
                  )}
                  {visibleColumns.includes("spec") && (
                    <td
                      className="px-6 py-4 text-slate-600 truncate"
                      title={fixture.brand || fixture.spec || '-'}
                    >
                      {fixture.brand || fixture.spec || '-'}
                    </td>
                  )}
                  {visibleColumns.includes("precision") && (
                    <td className="px-6 py-4 text-slate-500 truncate" title={fixture.precision || '-'}>{fixture.precision || '-'}</td>
                  )}
                  {visibleColumns.includes("usageRange") && (
                    <td className="px-6 py-4 text-slate-500 truncate" title={fixture.usageRange || '-'}>{fixture.usageRange || '-'}</td>
                  )}
                  {visibleColumns.includes("capacity") && (
                    <td className="px-6 py-4 text-slate-500 truncate" title={fixture.capacity || '-'}>{fixture.capacity || '-'}</td>
                  )}
                  {visibleColumns.includes("calPoints") && (
                    <td className="px-6 py-4 text-slate-500 truncate" title={fixture.calPoints || '-'}>{fixture.calPoints || '-'}</td>
                  )}
                  {visibleColumns.includes("acceptance") && (
                    <td className="px-6 py-4 text-slate-500 truncate" title={fixture.acceptance || '-'}>{fixture.acceptance || '-'}</td>
                  )}
                  {visibleColumns.includes("tafLogo") && (
                    <td className="px-6 py-4 text-slate-500 truncate" title={fixture.tafLogo || '-'}>{fixture.tafLogo || '-'}</td>
                  )}
                  {visibleColumns.includes("manager") && (
                    <td className="px-6 py-4 text-slate-600 truncate" title={fixture.manager || '-'}>{fixture.manager || '-'}</td>
                  )}
                  {visibleColumns.includes("calType") && (
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                        fixture.calType === '免校正'
                          ? 'bg-slate-100 text-slate-500' 
                          : 'bg-blue-50 text-kst-blue'
                      }`}>
                        {fixture.calType === '免校正' ? t('common.common.not_required') : (fixture.calType || '-')}
                      </span>
                    </td>
                  )}
                  {visibleColumns.includes("calibrationCycle") && (
                    <td className="px-6 py-4 text-slate-500 truncate" title={fixture.calibrationCycle?.toString()}>{fixture.calibrationCycle}</td>
                  )}
                  {visibleColumns.includes("lastCalDate") && (
                    <td className="px-6 py-4 text-slate-600">{formatLocaleDate(fixture.lastCalDate, language)}</td>
                  )}
                  {visibleColumns.includes("nextCalDate") && (
                    <td className="px-6 py-4">
                      {fixture.calculatedStatus === 'NO_CAL' ? (
                        <span className="text-slate-300 font-bold italic tracking-widest text-[10px]">{t('common.common.no_cal_needed')}</span>
                      ) : (
                        <div className="flex items-center gap-2 text-slate-700 font-medium">
                          <Calendar className="w-4 h-4 text-slate-300" />
                          {formatLocaleDate(fixture.nextCalDate, language)}
                        </div>
                      )}
                    </td>
                  )}
                  {visibleColumns.includes("location") && (
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <MapPin className="w-4 h-4 text-slate-300" />
                        {fixture.location === 'India' ? t('calibration.fixture.india') : t('calibration.fixture.taiwan')}
                      </div>
                    </td>
                  )}
                  {visibleColumns.includes("status") && (
                    <td className="px-6 py-4 text-center">
                      <StatusCell 
                        id={fixture.id} 
                        status={fixture.status} 
                        calculatedStatus={fixture.calculatedStatus} 
                      />
                    </td>
                  )}
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link 
                        href={`/Fixtures/${encodeURIComponent(fixture.id)}`}
                        className="p-2 text-slate-400 hover:text-kst-blue hover:bg-blue-50 rounded-lg transition-all"
                        title={t('common.common.details')}
                      >
                        <ExternalLink className="w-5 h-5" />
                      </Link>
                      
                      <button 
                        onClick={() => setCalibratingFixture(fixture)}
                        className="p-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-all"
                        title={t('calibration.cal.register_report')}
                      >
                        <FileSignature className="w-5 h-5" />
                      </button>

                      <FixtureEditModal fixture={fixture} />

                      <button 
                        onClick={async () => {
                          if (confirm(t('calibration.fixture.confirm_del', { id: fixture.id }))) {
                            try {
                              await batchDeleteFixturesAction([fixture.id]);
                              router.refresh();
                            } catch (e) {
                              alert(t('common.common.error_batch'));
                            }
                          }
                        }}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        title={t('calibration.fixture.delete')}
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

      {calibratingFixture && (
        <CalibrationModal
          isOpenExternal={true}
          gageId={calibratingFixture.id}
          calPoints={calibratingFixture.calPoints || ""}
          acceptance={calibratingFixture.acceptance || ""}
          calibrationCycle={calibratingFixture.calibrationCycle}
          acceptanceStandard={calibratingFixture.acceptanceStandard}
          vendors={vendors}
          onClose={() => setCalibratingFixture(null)}
        />
      )}
    </div>
  );
}
