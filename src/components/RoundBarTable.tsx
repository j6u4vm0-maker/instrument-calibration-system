"use client";

import { useState } from "react";
import { 
  ArrowUpDown, 
  MapPin, 
  Calendar,
  ExternalLink,
  ChevronDown,
  Check,
  Trash2,
  Edit2
} from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { StatusCell } from "@/components/StatusCell";
import { deleteRoundBarAction } from "@/app/actions/roundbar-actions";
import { useRouter } from "next/navigation";
import RoundBarEditModal from "./RoundBarEditModal";
import { CSVControls } from "./CSVControls";

interface RoundBarTableProps {
  roundBars: any[];
}

export default function RoundBarTable({ roundBars }: RoundBarTableProps) {
  const { t, language } = useLanguage();
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const ALL_COLUMNS = [
    { id: "id", label: t('roundBar.id'), alwaysVisible: true },
    { id: "name", label: t('roundBar.name'), alwaysVisible: true },
    { id: "spec", label: t('roundBar.spec') },
    { id: "usageRange", label: t('roundBar.usageRange') },
    { id: "calPoint1", label: t('roundBar.calPoint1') },
    { id: "calPoint2", label: t('roundBar.calPoint2') },
    { id: "rdIssuer", label: t('roundBar.rdIssuer') },
    { id: "calibrationCycle", label: t('roundBar.calibrationCycle') },
    { id: "lastCalDate", label: t('roundBar.lastCalDate') },
    { id: "nextCalDate", label: t('roundBar.nextCalDate') },
    { id: "status", label: t('roundBar.status') },
  ];

  const [visibleColumns, setVisibleColumns] = useState<string[]>(
    ALL_COLUMNS.map(c => c.id) // Default show all for Round Bar since it has fewer columns
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

  const sortedBars = [...roundBars].sort((a, b) => {
    if (!sortConfig.key || !sortConfig.direction) return 0;
    
    let aValue = a[sortConfig.key];
    let bValue = b[sortConfig.key];

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

  const handleDelete = async (id: string) => {
    if (!confirm(t('roundBar.confirm_del'))) return;
    try {
      await deleteRoundBarAction(id);
      router.refresh();
    } catch (error) {
      alert("Failed to delete round bar.");
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden flex flex-col relative">
      
      {/* Column Selector */}
      <div className="p-4 border-b border-slate-50 flex justify-end items-center gap-3 relative">
        <CSVControls type="round-bar" itemLabel={t('roundBar.title') || '圓棒清單'} />
        
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
                      ? 'text-amber-600 bg-amber-50/50' 
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
                        sortConfig.key === col.id && sortConfig.direction ? 'text-amber-500 opacity-100' : 'opacity-30'
                      }`} />
                    )}
                  </div>
                </th>
              ))}
              <th className="px-6 py-4 text-right w-24">{t('common.common.actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {sortedBars.length > 0 ? (
              sortedBars.map((item) => (
                <tr 
                  key={item.id} 
                  className="group hover:bg-slate-50/50 transition-colors"
                >
                  {visibleColumns.includes("id") && (
                    <td className="px-6 py-4 font-mono font-bold text-amber-600 truncate" title={item.id}>{item.id}</td>
                  )}
                  {visibleColumns.includes("name") && (
                    <td className="px-6 py-4 font-medium text-slate-800 truncate" title={item.name}>{item.name}</td>
                  )}
                  {visibleColumns.includes("spec") && (
                    <td className="px-6 py-4 text-slate-600 truncate" title={item.spec || '-'}>{item.spec || '-'}</td>
                  )}
                  {visibleColumns.includes("usageRange") && (
                    <td className="px-6 py-4 text-slate-500 truncate" title={item.usageRange || '-'}>{item.usageRange || '-'}</td>
                  )}
                  {visibleColumns.includes("calPoint1") && (
                    <td className="px-6 py-4 text-slate-500 truncate" title={item.calPoint1 || '-'}>{item.calPoint1 || '-'}</td>
                  )}
                  {visibleColumns.includes("calPoint2") && (
                    <td className="px-6 py-4 text-slate-500 truncate" title={item.calPoint2 || '-'}>{item.calPoint2 || '-'}</td>
                  )}
                  {visibleColumns.includes("rdIssuer") && (
                    <td className="px-6 py-4 text-slate-500 truncate" title={item.rdIssuer || '-'}>{item.rdIssuer || '-'}</td>
                  )}
                  {visibleColumns.includes("calibrationCycle") && (
                    <td className="px-6 py-4 text-slate-500 truncate" title={item.calibrationCycle?.toString()}>{item.calibrationCycle}</td>
                  )}
                  {visibleColumns.includes("lastCalDate") && (
                    <td className="px-6 py-4 text-slate-600">
                      {item.lastCalDate ? new Date(item.lastCalDate).toLocaleDateString(language === 'zh' ? 'zh-TW' : 'en-US') : '-'}
                    </td>
                  )}
                  {visibleColumns.includes("nextCalDate") && (
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-700 font-medium">
                        <Calendar className="w-4 h-4 text-slate-300" />
                        {item.nextCalDate ? new Date(item.nextCalDate).toLocaleDateString(language === 'zh' ? 'zh-TW' : 'en-US') : '-'}
                      </div>
                    </td>
                  )}
                  {visibleColumns.includes("status") && (
                    <td className="px-6 py-4 text-center">
                      <StatusCell 
                        id={item.id} 
                        status={item.status} 
                        calculatedStatus={item.status} // Or a derived status if applicable
                      />
                    </td>
                  )}
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <RoundBarEditModal roundBar={item} />

                      <button 
                        onClick={() => handleDelete(item.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        title={t('common.common.delete')}
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={15} className="px-6 py-20 text-center text-slate-400">{t('roundBar.no_data')}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
