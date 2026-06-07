"use client";

import { useState } from "react";
import { 
  Search, 
  Filter, 
  Download, 
  ArrowUpDown, 
  Calendar, 
  FileText, 
  Building2, 
  CheckCircle2, 
  XCircle, 
  Edit2, 
  Eye,
  Trash2, 
  Printer,
  Settings,
  GripVertical,
  ChevronUp,
  ChevronDown,
  RotateCcw,
  Clock
} from "lucide-react";
import { 
  batchDeleteRecordsAction, 
  updateCalibrationRecordAction,
  reviewCalibrationRecordAction
} from "@/app/actions/gage-actions";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import BatchRecordEditModal from "./BatchRecordEditModal";
import ReportRegistrationModal from "./ReportRegistrationModal";
import CalibrationModal from "./CalibrationModal";
import { HistoryControls } from "./HistoryControls";

interface RecordTableProps {
  records: any[];
  gages: any[];
  vendors: any[];
}

const getRecordColumns = (t: any) => [
  { id: 'selection', label: t('common.common.selection'), isFixed: true },
  { id: 'actions', label: t('common.common.actions') },
  { id: 'calDate', label: t('calibration.gage.last_cal') },
  { id: 'gageId', label: t('calibration.gage.id') },
  { id: 'gageName', label: t('calibration.gage.name') },
  { id: 'spec', label: t('calibration.gage.spec') },
  { id: 'usageRange', label: t('calibration.gage.range') },
  { id: 'cycle', label: t('calibration.gage.cycle') },
  { id: 'nextCalDate', label: t('calibration.gage.next_cal') },
  { id: 'calType', label: t('calibration.gage.cal_type') },
  { id: 'certificateNo', label: t('calibration.cal.cert_no') },
  { id: 'vendor', label: t('calibration.batch.vendor') },
  { id: 'result', label: t('calibration.cal.result') },
  { id: 'status', label: t('common.common.status') },
  { id: 'inspector', label: t('calibration.cal.inspector') },
];

const DEFAULT_ORDER = [
  'selection', 
  'actions', 
  'calDate', 
  'gageId', 
  'gageName', 
  'spec', 
  'usageRange', 
  'cycle', 
  'nextCalDate', 
  'calType', 
  'certificateNo', 
  'result',
  'status'
];

export default function RecordTable({ records, gages, vendors }: RecordTableProps) {
  const router = useRouter();
  const { role, t, language } = useLanguage();
  const ALL_RECORD_COLUMNS = getRecordColumns(t);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isLayoutOpen, setIsLayoutOpen] = useState(false);
  
  // 佈局狀態 (可存入 localStorage)
  const [columnOrder, setColumnOrder] = useState<string[]>(DEFAULT_ORDER);
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(new Set(DEFAULT_ORDER));

  // 篩選狀態
  const [filterResult, setFilterResult] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterVendor, setFilterVendor] = useState("");

  // 排序狀態
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  const [isFullEditOpen, setIsFullEditOpen] = useState(false);
  const [activeRecord, setActiveRecord] = useState<any>(null);

  // 複合篩選與搜尋
  const filteredRecords = records.filter(r => {
    const matchesSearch = 
      r.gageId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.gage.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.certificateNo && r.certificateNo.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesResult = !filterResult || r.result === filterResult;
    const matchesType = !filterType || r.reportType === filterType;
    const matchesVendor = !filterVendor || r.vendorId === filterVendor;

    return matchesSearch && matchesResult && matchesType && matchesVendor;
  }).sort((a, b) => {
    const dateA = new Date(a.calDate).getTime();
    const dateB = new Date(b.calDate).getTime();
    return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
  });

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredRecords.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredRecords.map(r => r.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);
    setSelectedIds(newSelected);
  };

  const handleDeleteSelected = async () => {
    if (!confirm(t('calibration.gage.confirm_del', { id: `${selectedIds.size} ${t('calibration.cal.total_records')}` }))) return;
    try {
      await batchDeleteRecordsAction(Array.from(selectedIds));
      setSelectedIds(new Set());
      router.refresh();
    } catch (error) {
      alert(t('common.common.error_batch') || 'Delete failed');
    }
  };

  const handleFullEditClick = (record: any) => {
    setActiveRecord(record);
    setIsFullEditOpen(true);
  };

  const moveColumn = (index: number, direction: 'up' | 'down') => {
    const newOrder = [...columnOrder];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newOrder.length) return;
    
    [newOrder[index], newOrder[targetIndex]] = [newOrder[targetIndex], newOrder[index]];
    setColumnOrder(newOrder);
  };

  const toggleColumnVisibility = (id: string) => {
    const newVisible = new Set(visibleColumns);
    if (newVisible.has(id)) newVisible.delete(id);
    else newVisible.add(id);
    setVisibleColumns(newVisible);
  };

  return (
    <div className="space-y-6 text-left">
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder={t('common.common.search_placeholder')} 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border-transparent rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-kst-blue/20 outline-none transition-all"
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <ReportRegistrationModal gages={gages} vendors={vendors} />
            <button 
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                isFilterOpen ? 'bg-kst-blue text-white shadow-lg shadow-blue-100' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Filter className="w-4 h-4" /> {t('common.common.filter')}
            </button>
            <div className="relative">
              <button 
                onClick={() => setIsLayoutOpen(!isLayoutOpen)}
                className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                  isLayoutOpen ? 'bg-slate-800 text-white' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Settings className="w-4 h-4" /> {t('common.common.layout')}
              </button>
              
              {isLayoutOpen && (
                <>
                  <div className="fixed inset-0 z-[60]" onClick={() => setIsLayoutOpen(false)} />
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-100 z-[70] p-4 animate-in fade-in zoom-in-95 duration-200">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-bold text-slate-800 text-sm">{t('calibration.gage.customize_header')}</h4>
                      <button 
                        onClick={() => {
                          setColumnOrder(DEFAULT_ORDER);
                          setVisibleColumns(new Set(DEFAULT_ORDER));
                        }}
                        className="p-1 text-slate-400 hover:text-kst-blue rounded-full transition-colors"
                        title={t('common.common.clear')}
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="space-y-1">
                      {columnOrder.map((colId, index) => {
                        const col = ALL_RECORD_COLUMNS.find(c => c.id === colId);
                        if (!col) return null;
                        const isVisible = visibleColumns.has(colId);
                        return (
                          <div 
                            key={colId} 
                            className={`flex items-center gap-2 p-2 rounded-lg transition-colors ${isVisible ? 'bg-slate-50' : 'opacity-40 grayscale'}`}
                          >
                            <input 
                              type="checkbox" 
                              checked={isVisible}
                              onChange={() => toggleColumnVisibility(colId)}
                              className="rounded border-slate-300 text-kst-blue focus:ring-kst-blue"
                            />
                            <span className="flex-1 text-xs font-bold text-slate-700">{col.label}</span>
                            <div className="flex gap-1">
                              <button 
                                onClick={() => moveColumn(index, 'up')}
                                disabled={index === 0}
                                className="p-1 text-slate-400 hover:text-kst-blue disabled:opacity-20"
                              >
                                <ChevronUp className="w-3.5 h-3.5" />
                              </button>
                              <button 
                                onClick={() => moveColumn(index, 'down')}
                                disabled={index === columnOrder.length - 1}
                                className="p-1 text-slate-400 hover:text-kst-blue disabled:opacity-20"
                              >
                                <ChevronDown className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>
            <HistoryControls />
          </div>
        </div>

        {isFilterOpen && (
          <div className="flex flex-wrap gap-4 pt-4 border-t border-slate-50 animate-in slide-in-from-top-2 duration-200">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">{t('calibration.cal.result')}</label>
              <select 
                value={filterResult} 
                onChange={(e) => setFilterResult(e.target.value)}
                className="block w-32 px-2 py-1.5 text-xs border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-kst-blue/20 bg-white"
              >
                <option value="">{t('common.common.all')}</option>
                <option value="PASS">{t('common.status.pass')}</option>
                <option value="FAIL">{t('calibration.cal.fail')}</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">{t('calibration.cal.type')}</label>
              <select 
                value={filterType} 
                onChange={(e) => setFilterType(e.target.value)}
                className="block w-32 px-2 py-1.5 text-xs border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-kst-blue/20 bg-white"
              >
                <option value="">{t('common.common.all')}</option>
                <option value="INTERNAL">{t('calibration.gage.internal')}</option>
                <option value="EXTERNAL">{t('calibration.gage.external')}</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">{t('calibration.batch.vendor')}</label>
              <select 
                value={filterVendor} 
                onChange={(e) => setFilterVendor(e.target.value)}
                className="block w-48 px-2 py-1.5 text-xs border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-kst-blue/20 bg-white"
              >
                <option value="">{t('common.common.all')}</option>
                {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
              </select>
            </div>
            <div className="flex items-end">
              <button 
                onClick={() => {
                  setFilterResult("");
                  setFilterType("");
                  setFilterVendor("");
                }}
                className="px-3 py-1.5 text-xs font-bold text-slate-400 hover:text-kst-blue"
              >
                {t('common.common.reset')}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden relative">
        
        {selectedIds.size > 0 && (
          <div className="sticky top-0 z-40 bg-kst-blue text-white px-6 py-3 flex items-center justify-between animate-in slide-in-from-top duration-300">
            <div className="flex items-center gap-4">
              <span className="text-sm font-bold">{t('common.common.selection')} {selectedIds.size} {t('calibration.cal.total_records')}</span>
              <button onClick={() => setSelectedIds(new Set())} className="text-xs font-medium hover:underline opacity-80">{t('common.common.cancel')}</button>
            </div>
            <div className="flex gap-2">
              <BatchRecordEditModal 
                selectedIds={Array.from(selectedIds)} 
                onSuccess={() => {
                  setSelectedIds(new Set());
                  router.refresh();
                }}
              />
              <button 
                onClick={handleDeleteSelected}
                className="px-4 py-2 bg-red-500 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-red-600 shadow-lg shadow-red-500/20"
              >
                <Trash2 className="w-4 h-4" /> {t('common.common.delete_selected')}
              </button>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
              <tr>
                {columnOrder.filter(id => visibleColumns.has(id)).map(colId => {
                  if (colId === 'selection') {
                    return (
                      <th key={colId} className="px-6 py-4 w-10">
                        <input 
                          type="checkbox" 
                          checked={selectedIds.size === filteredRecords.length && filteredRecords.length > 0}
                          onChange={toggleSelectAll}
                          className="rounded border-slate-300 text-kst-blue focus:ring-kst-blue"
                        />
                      </th>
                    );
                  }
                  if (colId === 'calDate') {
                    return (
                      <th 
                        key={colId}
                        className="px-6 py-4 cursor-pointer hover:bg-slate-100 transition-colors"
                        onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                      >
                        <div className="flex items-center gap-1">
                          {t('calibration.gage.last_cal')}
                          <ArrowUpDown className="w-3 h-3 opacity-50" />
                        </div>
                      </th>
                    );
                  }
                  const col = ALL_RECORD_COLUMNS.find(c => c.id === colId);
                  return <th key={colId} className="px-6 py-4">{col?.label}</th>;
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredRecords.map((record) => (
                <tr key={record.id} className="hover:bg-slate-50/50 transition-colors group">
                  {columnOrder.filter(id => visibleColumns.has(id)).map(colId => {
                    switch (colId) {
                      case 'selection':
                        return (
                          <td key={colId} className="px-6 py-4">
                            <input 
                              type="checkbox" 
                              checked={selectedIds.has(record.id)}
                              onChange={() => toggleSelect(record.id)}
                              className="rounded border-slate-300 text-kst-blue focus:ring-kst-blue"
                            />
                          </td>
                        );
                      case 'actions':
                        return (
                          <td key={colId} className="px-6 py-4">
                            <div className="flex items-center gap-1">
                              {record.reportType === 'INTERNAL' && (
                                <Link 
                                  href={`/reports/internal/${record.id}`}
                                  target="_blank"
                                  className="p-1.5 text-slate-400 hover:text-kst-blue hover:bg-blue-50 rounded-lg transition-all"
                                  title={t('calibration.cal.print')}
                                >
                                  <Printer className="w-4 h-4" />
                                </Link>
                              )}
                              <button 
                                onClick={() => handleFullEditClick(record)}
                                className="p-1.5 text-slate-400 hover:text-kst-blue hover:bg-blue-50 rounded-lg transition-all"
                                title={record.status === 'APPROVED' ? t('common.common.view') || '檢視' : t('calibration.cal.edit_report')}
                              >
                                {record.status === 'APPROVED' ? <Eye className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
                              </button>
                              
                              {(role === 'qa_manager' || role === 'admin') && record.status === 'PENDING' && (
                                <div className="flex items-center gap-1 ml-2 pl-2 border-l border-slate-200">
                                  <button 
                                    onClick={async () => {
                                      if(confirm(t('calibration.cal.confirm_approve'))) {
                                        await reviewCalibrationRecordAction(record.id, 'APPROVED');
                                        router.refresh();
                                      }
                                    }}
                                    className="px-2 py-1 bg-emerald-500 text-white rounded text-[10px] font-bold hover:bg-emerald-600 shadow-sm"
                                  >
                                    {t('calibration.cal.approve')}
                                  </button>
                                  <button 
                                    onClick={async () => {
                                      const notes = prompt(t('calibration.cal.reject_reason'));
                                      if(notes !== null) {
                                        await reviewCalibrationRecordAction(record.id, 'REJECTED', notes);
                                        router.refresh();
                                      }
                                    }}
                                    className="px-2 py-1 bg-red-500 text-white rounded text-[10px] font-bold hover:bg-red-600 shadow-sm"
                                  >
                                    {t('calibration.cal.reject')}
                                  </button>
                                </div>
                              )}
                            </div>
                          </td>
                        );
                      case 'calDate':
                        return (
                          <td key={colId} className="px-6 py-4">
                            <div className="flex items-center gap-2 text-slate-700 font-medium">
                              <Calendar className="w-4 h-4 text-slate-300" />
                              {new Date(record.calDate).toLocaleDateString(language === 'zh' ? 'zh-TW' : 'en-US')}
                            </div>
                          </td>
                        );
                      case 'gageId':
                        return (
                          <td key={colId} className="px-6 py-4 font-bold text-kst-blue font-mono">
                            {record.gageId}
                          </td>
                        );
                      case 'gageName':
                        return (
                          <td key={colId} className="px-6 py-4 font-medium text-slate-800">
                            {record.gage.name}
                          </td>
                        );
                      case 'spec':
                        return (
                          <td key={colId} className="px-6 py-4 text-slate-500 text-xs">
                            {record.gage.spec || '-'}
                          </td>
                        );
                      case 'usageRange':
                        return (
                          <td key={colId} className="px-6 py-4 text-slate-500 text-xs">
                            {record.gage.usageRange || '-'}
                          </td>
                        );
                      case 'cycle':
                        return (
                          <td key={colId} className="px-6 py-4 text-slate-500">
                            {record.gage.calibrationCycle}M
                          </td>
                        );
                      case 'nextCalDate':
                        return (
                          <td key={colId} className="px-6 py-4 text-slate-600 font-medium">
                            {new Date(record.gage.nextCalDate).toLocaleDateString(language === 'zh' ? 'zh-TW' : 'en-US')}
                          </td>
                        );
                      case 'calType':
                        return (
                          <td key={colId} className="px-6 py-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              record.gage.calType === '免校正' ? 'bg-slate-100 text-slate-500' : 'bg-blue-50 text-kst-blue'
                            }`}>
                              {record.gage.calType === '免校正' ? t('calibration.gage.non_cal') : (record.gage.calType || '-')}
                            </span>
                          </td>
                        );
                      case 'certificateNo':
                        return (
                          <td key={colId} className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1.5 text-slate-600 font-mono text-xs">
                                <FileText className="w-3.5 h-3.5 text-slate-300" />
                                {record.certificateNo || '-'}
                              </div>
                              {record.attachmentUrl && (
                                <a 
                                  href={record.attachmentUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="p-1 text-kst-blue hover:bg-blue-50 rounded transition-colors"
                                  title={t('calibration.cal.attachment')}
                                >
                                  <Download className="w-3.5 h-3.5" />
                                </a>
                              )}
                            </div>
                          </td>
                        );
                      case 'vendor':
                        return (
                          <td key={colId} className="px-6 py-4">
                            <div className="flex items-center gap-1.5 text-slate-500">
                              <Building2 className="w-3.5 h-3.5 text-slate-300" />
                              {record.vendor?.name || t('calibration.gage.internal')}
                            </div>
                          </td>
                        );
                      case 'result':
                        return (
                          <td key={colId} className="px-6 py-4">
                            {record.result === 'PASS' ? (
                              <span className="inline-flex items-center gap-1 text-emerald-600 font-bold text-xs">
                                <CheckCircle2 className="w-3.5 h-3.5" /> {t('common.status.pass')}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-red-600 font-bold text-xs">
                                <XCircle className="w-3.5 h-3.5" /> {t('calibration.cal.fail')}
                              </span>
                            )}
                          </td>
                        );
                      case 'status':
                        return (
                          <td key={colId} className="px-6 py-4">
                            {record.status === 'PENDING' && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 text-[10px] font-bold border border-amber-100">
                                <Clock className="w-3 h-3" /> {t('common.status.pending')}
                              </span>
                            )}
                            {record.status === 'APPROVED' && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold border border-emerald-100">
                                <CheckCircle2 className="w-3 h-3" /> {t('common.status.approved')}
                              </span>
                            )}
                            {record.status === 'REJECTED' && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-50 text-red-600 text-[10px] font-bold border border-red-100" title={record.reviewNotes}>
                                <XCircle className="w-3 h-3" /> {t('common.status.rejected')}
                              </span>
                            )}
                            {record.status === 'DRAFT' && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-50 text-slate-500 text-[10px] font-bold border border-slate-100">
                                <FileText className="w-3 h-3" /> {t('common.status.draft')}
                              </span>
                            )}
                          </td>
                        );
                      case 'inspector':
                        return (
                          <td key={colId} className="px-6 py-4 text-slate-500 text-xs">
                            {record.inspector}
                          </td>
                        );
                      default:
                        return null;
                    }
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isFullEditOpen && activeRecord && (
        <CalibrationModal
          isEdit={true}
          editData={activeRecord}
          isOpenExternal={true}
          gageId={activeRecord.gageId}
          calPoints={activeRecord.gage.calPoints || ""}
          acceptance={activeRecord.gage.acceptance || ""}
          calibrationCycle={activeRecord.gage.calibrationCycle}
          acceptanceStandard={activeRecord.gage.acceptanceStandard}
          vendors={vendors}
          onClose={() => {
            setIsFullEditOpen(false);
            setActiveRecord(null);
          }}
        />
      )}
    </div>
  );
}

