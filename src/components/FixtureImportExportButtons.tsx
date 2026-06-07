'use client';

import React, { useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import { ArrowRight } from "lucide-react";
import { importFixturesAction } from '@/app/actions/fixture-actions';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export function FixtureImportExportButtons({ fixtures }: { fixtures: any[] }) {
  const { t } = useLanguage();
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const flatData = fixtures.map(g => ({
      '管理編號/ID': g.id,
      '設備名稱/Name': g.name,
      '廠牌規格/Spec': g.brand || g.spec || '',
      '類別/Category': g.category || '',
      '廠區/Location': g.locationRef?.name || g.location || '',
      '部門/Department': g.departmentRef?.name || g.department || '',
      '保管人/Custodian': g.custodianRef?.name || '',
      '精度/Precision': g.precision || '',
      '使用範圍/Range': g.usageRange || '',
      '校正點/CalPoints': g.calPoints || '',
      '允收標準/Acceptance': g.acceptance || '',
      'TAF Logo': g.tafLogo || '',
      '入廠日期/EntryDate': g.entryDate ? new Date(g.entryDate).toISOString().split('T')[0] : '',
      '校正類別/CalType': g.calType || 'INTERNAL',
      '校正週期(月)/Cycle': g.calibrationCycle || 12,
      '上次校正/LastCalDate': g.lastCalDate ? new Date(g.lastCalDate).toISOString().split('T')[0] : '',
      '下次校正/NextCalDate': g.nextCalDate ? new Date(g.nextCalDate).toISOString().split('T')[0] : '',
      '狀態/Status': g.status || 'IN_USE',
      '備註/Notes': g.notes || ''
    }));

    const ws = XLSX.utils.json_to_sheet(flatData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Fixtures");
    XLSX.writeFile(wb, `FixtureInventory_${new Date().toISOString().split('T')[0]}.xlsx`);
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

      const parsedData = jsonData.map(row => ({
        id: String(row['管理編號/ID'] || row['管理編號'] || row['ID'] || row.id || ''),
        name: String(row['設備名稱/Name'] || row['設備名稱'] || row['Name'] || row.name || ''),
        serialNo: String(row['版次序號/SerialNo'] || row['版次/序號'] || row['SerialNo'] || row.serialNo || ''),
        applicablePart: String(row['適用料號/ApplicablePart'] || row['適用料號'] || row.applicablePart || ''),
        drawingNo: String(row['對應圖號/DrawingNo'] || row['對應圖號 / 檢驗書'] || row['DrawingNo'] || row.drawingNo || ''),
        manual: String(row['使用說明書/Manual'] || row['使用說明書'] || row.manual || ''),
        // 廠牌欄位：兼容新舊格式
        spec: String(row['廠牌規格/Spec'] || row['廠牌規格'] || row['廠牌'] || row['Spec'] || row.spec || row.brand || ''),
        category: String(row['類別/Category'] || row['類別'] || row['Category'] || row.category || ''),
        location: String(row['廠區/Location'] || row['廠區'] || row['Location'] || row.location || ''),
        department: String(row['部門/Department'] || row['部門'] || row['Department'] || row.department || ''),
        custodian: String(row['保管人/Custodian'] || row['保管人'] || row['Custodian'] || row.custodian || ''),
        manager: String(row['管理者/Manager'] || row['管理者'] || row['Manager'] || row.manager || ''),
        rdIssuer: String(row['RD發行人/RDIssuer'] || row['RD發行人'] || row['RDIssuer'] || row.rdIssuer || ''),
        precision: String(row['精度/Precision'] || row['精度'] || row['Precision'] || row.precision || ''),
        calPoints: String(row['校正點/CalPoints'] || row['校正點'] || row['CalPoints'] || row.calPoints || ''),
        acceptance: String(row['允收標準/Acceptance'] || row['允收標準'] || row['Acceptance'] || row.acceptance || ''),
        tafLogo: String(row['TAF Logo'] || row['tafLogo'] || ''),
        entryDate: row['入廠日期/EntryDate'] || row['入廠日期'] || row['EntryDate'] || row.entryDate || null,
        calType: String(row['校正類別/CalType'] || row['校驗類別'] || row['校正類別'] || row['CalType'] || row.calType || 'INTERNAL'),
        calibrationCycle: parseInt(row['校正週期(月)/Cycle'] || row['校驗週期'] || row['校正週期'] || row['Cycle'] || row.calibrationCycle || '12'),
        lastCalDate: row['上次校正/LastCalDate'] || row['上次校正日'] || row['上次校正'] || row['LastCalDate'] || row.lastCalDate || null,
        nextCalDate: row['下次校正/NextCalDate'] || row['預計校正日'] || row['下次校正'] || row['NextCalDate'] || row.nextCalDate || null,
        status: String(row['狀態/Status'] || row['狀態'] || row['Status'] || row.status || 'IN_USE'),
        notes: String(row['備註/Notes'] || row['備註'] || row['Notes'] || row.notes || '')
      })).filter(row => row.id && row.name);

      if (parsedData.length === 0) {
        alert("Invalid file format or no valid data found.");
        return;
      }

      const res = await importFixturesAction(parsedData);
      alert(`Import Successful!\nImported: ${res.imported}\nUpdated: ${res.updated}`);
    } catch (error) {
      console.error(error);
      alert("Error parsing file");
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex items-center gap-2">
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
        className="flex items-center justify-center w-9 h-9 bg-white border border-slate-200 text-slate-500 rounded-lg hover:bg-slate-50 hover:text-kst-blue transition-colors disabled:opacity-50"
        title={t('common.common.import')}
      >
        {isImporting ? <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" /> : <ArrowRight className="w-4 h-4 rotate-90" />}
      </button>
      <button 
        onClick={handleExport}
        className="flex items-center justify-center w-9 h-9 bg-white border border-slate-200 text-slate-500 rounded-lg hover:bg-slate-50 hover:text-kst-blue transition-colors"
        title={t('common.common.export')}
      >
        <ArrowRight className="w-4 h-4 -rotate-90" />
      </button>
    </div>
  );
}
