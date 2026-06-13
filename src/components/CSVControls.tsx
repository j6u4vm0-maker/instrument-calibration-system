'use client';

import React, { useMemo, useRef, useState } from 'react';
import { Upload, Download, Loader2 } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { importGagesAction } from '@/app/actions/gage-actions';
import { importFixturesAction } from '@/app/actions/fixture-actions';
import { importRoundBarsAction } from '@/app/actions/roundbar-actions';
import * as XLSX from 'xlsx';
import { useSearchParams } from 'next/navigation';

type CSVControlsProps = {
  type?: 'gage' | 'fixture' | 'round-bar';
  itemLabel?: string;
  uploadLabel?: string;
  downloadLabel?: string;
  uploadTitle?: string;
  downloadTitle?: string;
};

export function CSVControls({
  type = 'gage',
  itemLabel,
  uploadLabel,
  downloadLabel,
  uploadTitle,
  downloadTitle,
}: CSVControlsProps) {
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const location = searchParams.get('location');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [timestamp, setTimestamp] = useState('');

  React.useEffect(() => {
    setTimestamp(Date.now().toString());
  }, []);

  const labels = useMemo(() => {
    const defaultLabel = type === 'gage' ? t('calibration.gage.list') 
                       : type === 'round-bar' ? '圓棒清單'
                       : '檢具清單';
    const resolvedItemLabel = itemLabel || defaultLabel;
    return {
      uploadText: uploadLabel || `${t('common.common.upload')} ${resolvedItemLabel}`,
      downloadText: downloadLabel || `${t('common.common.download')} ${resolvedItemLabel}`,
      uploadHint: uploadTitle || `${t('common.common.upload')} ${resolvedItemLabel}`,
      downloadHint: downloadTitle || `${t('common.common.download')} ${resolvedItemLabel}`,
    };
  }, [downloadLabel, downloadTitle, itemLabel, type, t, uploadLabel, uploadTitle]);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const parseText = (value: any) => String(value ?? '').trim();
  const parseBlock = (value: any) => parseText(value).replace(/\r?\n+/g, '\n');

  const parseExcelDate = (value: any) => {
    if (value === null || value === undefined || value === '') return null;
    if (value instanceof Date) return isNaN(value.getTime()) ? null : value;
    if (typeof value === 'number') {
      const parsed = new Date((value - 25569) * 86400 * 1000);
      return isNaN(parsed.getTime()) ? null : parsed;
    }
    const text = parseText(value);
    if (!text) return null;
    const numeric = Number(text);
    if (!Number.isNaN(numeric) && numeric > 10000 && numeric < 100000) {
      const parsed = new Date((numeric - 25569) * 86400 * 1000);
      return isNaN(parsed.getTime()) ? null : parsed;
    }
    const parsed = new Date(text.replace(/\./g, '/').replace(/-/g, '/'));
    return isNaN(parsed.getTime()) ? null : parsed;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const data = await file.arrayBuffer();
      const wb = XLSX.read(data);
      const ws = wb.Sheets[wb.SheetNames[0]];
      const jsonData: any[] = XLSX.utils.sheet_to_json(ws);

      if (type === 'gage') {
        const parsedData = jsonData.map(row => ({
          id: parseText(row['儀器設備編號/ID'] || row['ID'] || row.id || row['儀器設備編號']),
          name: parseText(row['儀器設備名稱/Name'] || row['Name'] || row.name || row['儀器設備名稱']),
          spec: parseText(row['廠牌規格/Spec'] || row['Spec'] || row.spec || row['廠牌']),
          category: parseText(row['類別/Category'] || row['Category'] || row.category || row['類別']),
          location: parseText(row['廠區/Location'] || row['Location'] || row.location || row['廠區'] || row['部門']),
          department: parseText(row['部門/Department'] || row['Department'] || row.department || row['部門']),
          custodian: parseText(row['保管人/Custodian'] || row['Custodian'] || row.custodian || row['保管人']),
          manager: parseText(row['管理者/Manager'] || row['Manager'] || row.manager || row['管理者']),
          vendor: parseText(row['供應商/Vendor'] || row['Vendor'] || row.vendor || row['供應商']),
          precision: parseText(row['精度/Precision'] || row['Precision'] || row.precision || row['精度']),
          usageRange: parseText(row['使用範圍/UsageRange'] || row['Range'] || row.usageRange || row['使用範圍']),
          calPoints: parseBlock(row['校正點位/CalPoints'] || row['CalPoints'] || row.calPoints || row['校正點位']),
          acceptance: parseBlock(row['校驗標準/Acceptance'] || row['Acceptance'] || row.acceptance || row['校驗標準']),
          tafLogo: parseText(row['TAF Logo'] || row.tafLogo),
          entryDate: parseExcelDate(row['入廠日期/EntryDate'] || row['EntryDate'] || row.entryDate || row['入廠日期']),
          calType: parseText(row['校正類別/CalType'] || row['CalType'] || row.calType || row['校驗類別']) || 'INTERNAL',
          calibrationCycle: parseInt(parseText(row['校正週期(月)/Cycle'] || row['Cycle'] || row.calibrationCycle || row['校驗週期'] || '12'), 10),
          lastCalDate: parseExcelDate(row['上次校正日/LastCalDate'] || row['LastCalDate'] || row.lastCalDate || row['上次校正日']),
          nextCalDate: parseExcelDate(row['下次校正日/NextCalDate'] || row['NextCalDate'] || row.nextCalDate || row['預計校正日']),
          status: parseText(row['狀態/Status'] || row['Status'] || row.status || row['狀態']) || 'IN_USE',
          notes: parseBlock(row['備註/Notes'] || row['Notes'] || row.notes || row['備註']),
        })).filter(row => row.id && row.name);

        if (parsedData.length === 0) {
          alert('匯入失敗：找不到可用的量具資料。');
          return;
        }

        const result = await importGagesAction(parsedData);
        alert(`匯入成功！\n新增: ${result.imported}\n更新: ${result.updated}`);
        window.location.reload();
      } else if (type === 'fixture') {
        const parsedData = jsonData.map(row => {
          const serialNo = parseText(row['版次序號/SerialNo'] || row['版次/序號'] || row['SerialNo'] || row.serialNo);
          const baseId = parseText(row['管理編號/ID'] || row['儀器設備編號'] || row['ID'] || row.id);
          const id = baseId
            ? (baseId.includes('(') ? baseId : (serialNo ? `${baseId}${serialNo.startsWith('(') ? serialNo : `(${serialNo})`}` : baseId))
            : '';

          return {
            id,
            name: parseBlock(row['設備名稱/Name'] || row['儀器設備名稱'] || row['Name'] || row.name),
            serialNo,
            brand: parseText(row['廠牌規格/Spec'] || row['廠牌'] || row['Brand'] || row.brand),
            applicablePart: parseBlock(row['適用料號/ApplicablePart'] || row['適用料號'] || row['ApplicablePart'] || row.applicablePart),
            drawingNo: parseBlock(row['對應圖號/DrawingNo'] || row['對應圖號 / 檢驗書'] || row['DrawingNo'] || row.drawingNo),
            manual: parseBlock(row['使用說明書/Manual'] || row['使用說明書'] || row['Manual'] || row.manual),
            category: parseText(row['類別/Category'] || row['類別'] || row['Category'] || row.category),
            precision: parseText(row['精度/Precision'] || row['精度'] || row['Precision'] || row.precision),
            displayType: parseText(row['顯示'] || row['Display'] || row.displayType),
            calType: parseText(row['校正類別/CalType'] || row['校驗類別'] || row['CalType'] || row.calType) || 'INTERNAL',
            calibrationCycle: parseInt(parseText(row['校正週期(月)/Cycle'] || row['校驗週期'] || row['Cycle'] || row.calibrationCycle || '12'), 10),
            lastCalDate: parseExcelDate(row['上次校正/LastCalDate'] || row['上次校正日'] || row['LastCalDate'] || row.lastCalDate),
            nextCalDate: parseExcelDate(row['下次校正/NextCalDate'] || row['預計校正日'] || row['NextCalDate'] || row.nextCalDate),
            calPoints: parseBlock(row['校正點/CalPoints'] || row['校正點位'] || row['CalPoints'] || row.calPoints),
            tafLogo: parseText(row['TAF Logo'] || row.tafLogo),
            entryDate: parseExcelDate(row['入廠日期/EntryDate'] || row['入廠日期'] || row['EntryDate'] || row.entryDate),
            status: parseText(row['狀態/Status'] || row['狀態'] || row['Status'] || row.status) || 'IN_USE',
            notes: parseBlock(row['備註/Notes'] || row['備註'] || row['Notes'] || row.notes),
            department: parseText(row['部門/Department'] || row['部門'] || row['Department'] || row.department),
            manager: parseText(row['管理者/Manager'] || row['管理者'] || row['Manager'] || row.manager),
            vendor: parseText(row['供應商/Vendor'] || row['供應商'] || row['Vendor'] || row.vendor),
            rdIssuer: parseText(row['RD發行人/RDIssuer'] || row['RD發行人'] || row['RDIssuer'] || row.rdIssuer),
          };
        }).filter(row => row.id && row.name);

        if (parsedData.length === 0) {
          alert('匯入失敗：找不到可用的檢具資料。');
          return;
        }

      const result: any = await importFixturesAction(parsedData);
        if (result.success) {
          alert(`匯入成功！\n新增: ${result.imported}\n更新: ${result.updated}`);
          window.location.reload();
        } else {
          alert(`匯入失敗：${result.error}`);
        }
      } else if (type === 'round-bar') {
        const parsedData = jsonData.map(row => {
          const id = parseText(row['儀器設備編號/ID'] || row['ID'] || row.id || row['儀器設備編號']);
          return {
            id,
            name: parseBlock(row['儀器設備名稱/Name'] || row['Name'] || row.name || row['儀器設備名稱']),
            spec: parseText(row['廠牌規格/Spec'] || row['Spec'] || row.spec || row['廠牌']),
            usageRange: parseText(row['使用範圍/UsageRange'] || row['Range'] || row.usageRange || row['使用範圍']),
            location: parseText(row['廠區/Location'] || row['Location'] || row.location || row['廠區']),
            department: parseText(row['部門/Department'] || row['Department'] || row.department || row['部門']),
            manager: parseText(row['管理者/Manager'] || row['Manager'] || row.manager || row['管理者']),
            calPoint1: parseText(row['校正點1/CalPoint1'] || row['CalPoint1'] || row.calPoint1 || row['校正點1']),
            calPoint2: parseText(row['校正點2/CalPoint2'] || row['CalPoint2'] || row.calPoint2 || row['校正點2']),
            rdIssuer: parseText(row['RD發行人/RDIssuer'] || row['RD發行人'] || row['RDIssuer'] || row.rdIssuer),
            entryDate: parseExcelDate(row['入廠日期/EntryDate'] || row['EntryDate'] || row.entryDate || row['入廠日期']),
            calibrationCycle: parseInt(parseText(row['校正週期(月)/Cycle'] || row['Cycle'] || row.calibrationCycle || row['校驗週期'] || '12'), 10),
            lastCalDate: parseExcelDate(row['上次校正日/LastCalDate'] || row['LastCalDate'] || row.lastCalDate || row['上次校正日']),
            nextCalDate: parseExcelDate(row['下次校正日/NextCalDate'] || row['NextCalDate'] || row.nextCalDate || row['預計校正日']),
            status: parseText(row['狀態/Status'] || row['Status'] || row.status || row['狀態']) || 'IN_USE',
            notes: parseBlock(row['備註/Notes'] || row['Notes'] || row.notes || row['備註']),
          };
        }).filter(row => row.id && row.name);

        if (parsedData.length === 0) {
          alert('匯入失敗：找不到可用的圓棒資料。');
          return;
        }

        const result: any = await importRoundBarsAction(parsedData);
        alert(`匯入成功！\n新增: ${result.imported}\n更新: ${result.updated}`);
        window.location.reload();
      }
    } catch (error) {
      console.error('Import failed:', error);
      alert(t('common.common.import_failed'));
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex gap-3">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".xlsx, .xls, .csv"
        className="hidden"
      />

      <button
        onClick={handleImportClick}
        disabled={isUploading}
        title={labels.uploadHint}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg font-bold hover:bg-slate-50 transition-all shadow-sm disabled:opacity-50"
      >
        {isUploading ? (
          <Loader2 className="w-4 h-4 animate-spin text-kst-blue" />
        ) : (
          <Upload className="w-4 h-4 text-kst-blue" />
        )}
        <span>{isUploading ? t('common.common.processing') : labels.uploadText}</span>
      </button>

      <a
        href={location ? `/api/${type}s/export?location=${location}&t=${timestamp}` : `/api/${type}s/export?t=${timestamp}`}
        download
        title={labels.downloadHint}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg font-bold hover:bg-slate-50 transition-all shadow-sm"
      >
        <Download className="w-4 h-4 text-emerald-500" />
        <span>{labels.downloadText}</span>
      </a>
    </div>
  );
}
