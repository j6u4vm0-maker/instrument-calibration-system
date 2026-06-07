'use client';

import React, { useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import { ArrowRight, Download } from "lucide-react";
import { importStandardsAction } from '@/app/actions/standard-actions';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export function StandardImportExportButtons({ standards }: { standards: any[] }) {
  const { t } = useLanguage();
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    // If no standards, export a template
    if (!standards || standards.length === 0) {
      const templateData = [{
        '標準名稱': '範例標準',
        '綁定儀器類別': '游標卡尺',
        '判定類型': 'STEPPED',
        '預設週期(月)': 12,
        '預設精度': '0.01mm',
        '點位類別': '外徑',
        '校正點位': '0, 25, 50, 75, 100',
        '點位單位': 'mm',
        '範圍起點': 0,
        '範圍終點': 100,
        '正公差(+)': 0.02,
        '負公差(-)': -0.02
      }];
      const ws = XLSX.utils.json_to_sheet(templateData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Standards");
      XLSX.writeFile(wb, `StandardsTemplate.xlsx`);
      return;
    }

    const flatData: any[] = [];
    standards.forEach(standard => {
      // Find maximum number of criteria or points to determine rows per standard
      const criteriaCount = standard.criteria?.length || 0;
      const rowsCount = Math.max(1, criteriaCount);

      for (let i = 0; i < rowsCount; i++) {
        const criterion = standard.criteria?.[i];
        const point = standard.points?.find((p: any) => p.category === criterion?.category) || standard.points?.[0];

        flatData.push({
          '標準名稱': i === 0 ? standard.name : standard.name, // Keep name for grouping
          '綁定儀器類別': i === 0 ? (standard.targetCategory || '') : '',
          '判定類型': i === 0 ? standard.type : '',
          '預設週期(月)': i === 0 ? (standard.defaultCycle || 12) : '',
          '預設精度': i === 0 ? (standard.defaultPrecision || '') : '',
          '點位類別': criterion?.category || point?.category || '',
          '校正點位': point?.points || '',
          '點位單位': point?.unit || criterion?.unit || 'mm',
          '範圍起點': criterion?.rangeStart ?? '',
          '範圍終點': criterion?.rangeEnd ?? '',
          '正公差(+)': criterion?.tolerancePlus ?? '',
          '負公差(-)': criterion?.toleranceMinus ?? ''
        });
      }
    });

    const ws = XLSX.utils.json_to_sheet(flatData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Standards");
    XLSX.writeFile(wb, `StandardsLibrary_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const data = await file.arrayBuffer();
      const wb = XLSX.read(data);
      const ws = wb.Sheets[wb.SheetNames[0]];
      const jsonData: any[] = XLSX.utils.sheet_to_json(ws);

      if (jsonData.length === 0) {
        alert("Invalid file format or no valid data found.");
        return;
      }

      const res = await importStandardsAction(jsonData);
      if (res.success) {
        alert(`匯入成功！\n新增: ${res.imported}\n更新: ${res.updated}`);
      } else {
        alert(`匯入失敗: ${res.error}`);
      }
    } catch (error) {
      console.error(error);
      alert("Error parsing file");
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex items-center gap-2 mr-2">
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleImport} 
        accept=".xlsx, .xls, .csv" 
        className="hidden" 
      />
      <button 
        onClick={() => fileInputRef.current?.click()}
        disabled={isImporting}
        className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 text-slate-600 font-medium rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50 text-sm"
        title="匯入允收標準"
      >
        {isImporting ? <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" /> : <ArrowRight className="w-4 h-4 rotate-90" />}
        匯入Excel
      </button>
      <button 
        onClick={handleExport}
        className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 text-slate-600 font-medium rounded-lg hover:bg-slate-50 transition-colors text-sm"
        title="匯出/下載範本"
      >
        <Download className="w-4 h-4" />
        {standards && standards.length > 0 ? '匯出Excel' : '下載範本'}
      </button>
    </div>
  );
}
