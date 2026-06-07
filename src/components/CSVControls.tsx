'use client';

import React, { useMemo, useRef, useState } from 'react';
import { Upload, Download, Loader2 } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { importGagesAction } from '@/app/actions/gage-actions';
import { importFixturesAction } from '@/app/actions/fixture-actions';
import * as XLSX from 'xlsx';
import { useSearchParams } from 'next/navigation';

type CSVControlsProps = {
  type?: 'gage' | 'fixture';
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
    const resolvedItemLabel = itemLabel || (type === 'gage' ? t('calibration.gage.list') : '檢具清單');
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
          id: parseText(row['ID'] || row.id || row['儀器設備編號']),
          name: parseText(row['Name'] || row.name || row['儀器設備名稱']),
          spec: parseText(row['Spec'] || row.spec || row['廠牌']),
          category: parseText(row['Category'] || row.category || row['類別']),
          location: parseText(row['Location'] || row.location || row['部門']),
          department: parseText(row['Department'] || row.department || row['部門']),
          custodian: parseText(row['Custodian'] || row.custodian),
          precision: parseText(row['Precision'] || row.precision || row['精度']),
          usageRange: parseText(row['Range'] || row.usageRange || row['使用範圍']),
          calPoints: parseBlock(row['CalPoints'] || row.calPoints || row['校正點位']),
          acceptance: parseBlock(row['Acceptance'] || row.acceptance || row['校驗標準']),
          tafLogo: parseText(row['TAF Logo'] || row.tafLogo),
          entryDate: parseExcelDate(row['EntryDate'] || row.entryDate || row['入廠日期']),
          calType: parseText(row['CalType'] || row.calType || row['校驗類別']) || 'INTERNAL',
          calibrationCycle: parseInt(parseText(row['Cycle'] || row.calibrationCycle || row['校驗週期'] || '12'), 10),
          lastCalDate: parseExcelDate(row['LastCalDate'] || row.lastCalDate || row['上次校正日']),
          nextCalDate: parseExcelDate(row['NextCalDate'] || row.nextCalDate || row['預計校正日']),
          status: parseText(row['Status'] || row.status || row['狀態']) || 'IN_USE',
          notes: parseBlock(row['Notes'] || row.notes || row['備註']),
        })).filter(row => row.id && row.name);

        if (parsedData.length === 0) {
          alert('匯入失敗：找不到可用的量具資料。');
          return;
        }

        const result = await importGagesAction(parsedData);
        alert(`匯入成功！\n新增: ${result.imported}\n更新: ${result.updated}`);
        window.location.reload();
      } else {
        const parsedData = jsonData.map(row => {
          const serialNo = parseText(row['版次/序號'] || row['SerialNo'] || row.serialNo);
          const baseId = parseText(row['儀器設備編號'] || row['ID'] || row.id);
          const id = baseId
            ? (baseId.includes('(') ? baseId : (serialNo ? `${baseId}${serialNo.startsWith('(') ? serialNo : `(${serialNo})`}` : baseId))
            : '';

          return {
            id,
            name: parseBlock(row['儀器設備名稱'] || row['Name'] || row.name),
            serialNo,
            brand: parseText(row['廠牌'] || row['Brand'] || row.brand),
            applicablePart: parseBlock(row['適用料號'] || row['ApplicablePart'] || row.applicablePart),
            drawingNo: parseBlock(row['對應圖號 / 檢驗書'] || row['DrawingNo'] || row.drawingNo),
            manual: parseBlock(row['使用說明書'] || row['Manual'] || row.manual),
            category: parseText(row['類別'] || row['Category'] || row.category),
            precision: parseText(row['精度'] || row['Precision'] || row.precision),
            displayType: parseText(row['顯示'] || row['Display'] || row.displayType),
            calType: parseText(row['校驗類別'] || row['CalType'] || row.calType) || 'INTERNAL',
            calibrationCycle: parseInt(parseText(row['校驗週期'] || row['Cycle'] || row.calibrationCycle || '12'), 10),
            lastCalDate: parseExcelDate(row['上次校正日'] || row['LastCalDate'] || row.lastCalDate),
            nextCalDate: parseExcelDate(row['預計校正日'] || row['NextCalDate'] || row.nextCalDate),
            calPoints: parseBlock(row['校正點位'] || row['CalPoints'] || row.calPoints),
            tafLogo: parseText(row['TAF Logo'] || row.tafLogo),
            entryDate: parseExcelDate(row['入廠日期'] || row['EntryDate'] || row.entryDate),
            status: parseText(row['狀態'] || row['Status'] || row.status) || 'IN_USE',
            notes: parseBlock(row['備註'] || row['Notes'] || row.notes),
            department: parseText(row['部門'] || row['Department'] || row.department),
            manager: parseText(row['管理者'] || row['Manager'] || row.manager),
            vendor: parseText(row['供應商'] || row['Vendor'] || row.vendor),
            rdIssuer: parseText(row['RD發行人'] || row['RDIssuer'] || row.rdIssuer),
          };
        }).filter(row => row.id && row.name);

        if (parsedData.length === 0) {
          alert('匯入失敗：找不到可用的檢具資料。');
          return;
        }

        const result = await importFixturesAction(parsedData);
        if (result.success) {
          alert(`匯入成功！\n新增: ${result.imported}\n更新: ${result.updated}`);
          window.location.reload();
        } else {
          alert(`匯入失敗：${result.error}`);
        }
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
