'use client';

import React, { useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import { ArrowRight } from "lucide-react";
import { importVendorsAction } from '@/app/actions/vendor-actions';
import { useLanguage } from '@/lib/i18n/LanguageContext';

function pickValue(row: any, keys: string[]) {
  for (const key of keys) {
    const value = row[key];
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      return value;
    }
  }
  return "";
}

function buildNotes(row: any, consumedKeys: Set<string>) {
  const extraEntries = Object.entries(row).filter(([key, value]) => {
    if (consumedKeys.has(key)) return false;
    return value !== undefined && value !== null && String(value).trim() !== "";
  });

  if (extraEntries.length === 0) return "";

  return extraEntries
    .map(([key, value]) => `${key}: ${String(value).trim()}`)
    .join("\n");
}

function normalizeWhitespace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function splitVendorCodeAndName(rawVendor: string) {
  const value = normalizeWhitespace(rawVendor);
  const match = value.match(/^(?<code>[^_]+)_(?<name>.+)$/);

  if (!match?.groups) {
    return { vendorCode: "", name: value };
  }

  return {
    vendorCode: normalizeWhitespace(match.groups.code),
    name: normalizeWhitespace(match.groups.name),
  };
}

function inferVendorType(rawType: string, fallbackType: string) {
  const normalized = normalizeWhitespace(rawType);

  if (!normalized) return fallbackType;
  if (normalized === "校正") return "CALIBRATION";
  if (normalized === "原廠/校正" || normalized === "原廠" || normalized === "設備") return "OEM_CALIBRATION";
  if (normalized === "*") return "CALIBRATION";
  return normalized;
}

function mergeTextParts(...parts: Array<string | undefined>) {
  const normalized = parts
    .map((part) => normalizeWhitespace(part || ""))
    .filter(Boolean);

  return Array.from(new Set(normalized)).join("\n");
}

function mergeInlineValues(...parts: Array<string | undefined>) {
  const normalized = parts
    .map((part) => normalizeWhitespace(part || ""))
    .filter(Boolean);

  return Array.from(new Set(normalized)).join(" / ");
}

export function VendorImportExportButtons({
  vendors,
  defaultType = "OUTSOURCE",
}: {
  vendors: any[];
  defaultType?: string;
}) {
  const { t } = useLanguage();
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const flatData = vendors.map(v => ({
      '廠商代碼/Vendor Code': v.vendorCode || '',
      '廠商名稱/Vendor Name': v.name,
      '廠商簡稱/Short Name': v.shortName || '',
      '類型/Type': v.type || '',
      '聯絡人/Contact': v.contact || '',
      '電話/Phone': v.phone || '',
      '行動電話/Mobile': v.mobile || '',
      '傳真/Fax': v.fax || '',
      '信箱/Email': v.email || '',
      '網站/Website': v.website || '',
      '服務項目/Service Scope': v.serviceScope || '',
      '地址/Address': v.address || '',
      '備註/Notes': v.notes || ''
    }));

    const ws = XLSX.utils.json_to_sheet(flatData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Vendors");
    XLSX.writeFile(wb, `Vendors_${new Date().toISOString().split('T')[0]}.xlsx`);
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

      const parsedData = jsonData.map((row) => {
        const consumedKeys = new Set<string>([
          '廠商代碼/Vendor Code', '廠商代碼', 'Vendor Code', '代碼', '編號',
          '廠商名稱/Vendor Name', '廠商名稱', 'Vendor Name', '供應商名稱', '廠商',
          '廠商簡稱/Short Name', '廠商簡稱', 'Short Name', '簡稱',
          '類型/Type', '類型', 'Type',
          '聯絡人/Contact', '聯絡人', 'Contact', '聯繫人',
          '電話/Phone', '電話', 'Phone', '公司電話', '電話 ',
          '行動電話/Mobile', '行動電話', 'Mobile', '手機', '聯絡電話',
          '傳真/Fax', '傳真', 'Fax', '傳真電話',
          '信箱/Email', '信箱', 'Email', '電子郵件', '電子郵件 ',
          '網站/Website', '網站', 'Website', '網址',
          '服務項目/Service Scope', '服務項目', 'Service Scope', '校正項目', '服務範圍', '校驗項目',
          '地址/Address', '地址', 'Address',
          '備註/Notes', '備註', 'Notes', '說明',
        ]);

        const rawVendor = String(
          pickValue(row, ['廠商名稱/Vendor Name', '廠商名稱', 'Vendor Name', '供應商名稱', '廠商']) || ''
        );
        const splitVendor = splitVendorCodeAndName(rawVendor);

        const rawEmail = String(
          pickValue(row, ['信箱/Email', '信箱', 'Email', '電子郵件', '電子郵件 ']) || ''
        );
        const rawFax = String(
          pickValue(row, ['傳真/Fax', '傳真', 'Fax', '傳真電話']) || ''
        );
        const rawWebsite = String(
          pickValue(row, ['網站/Website', '網站', 'Website', '網址']) || ''
        );

        const email = rawEmail.includes('@')
          ? rawEmail
          : rawFax.includes('@')
            ? rawFax
            : '';
        const website = rawWebsite.startsWith('http')
          ? rawWebsite
          : rawEmail.startsWith('http')
            ? rawEmail
            : '';
        const fax = rawFax.includes('@') ? '' : rawFax;

        const notes = [
          pickValue(row, ['備註/Notes', '備註', 'Notes', '說明']),
          buildNotes(row, consumedKeys),
        ]
          .filter(Boolean)
          .join('\n');

        return {
          vendorCode: normalizeWhitespace(String(pickValue(row, ['廠商代碼/Vendor Code', '廠商代碼', 'Vendor Code', '代碼', '編號']) || splitVendor.vendorCode)),
          name: normalizeWhitespace(splitVendor.name),
          shortName: String(pickValue(row, ['廠商簡稱/Short Name', '廠商簡稱', 'Short Name', '簡稱']) || ''),
          type: inferVendorType(String(pickValue(row, ['類型/Type', '類型', 'Type', '類別']) || ''), defaultType),
          contact: normalizeWhitespace(String(pickValue(row, ['聯絡人/Contact', '聯絡人', 'Contact', '聯繫人']) || '')),
          phone: normalizeWhitespace(String(pickValue(row, ['電話/Phone', '電話', 'Phone', '公司電話', '電話 ']) || '')),
          mobile: normalizeWhitespace(String(pickValue(row, ['行動電話/Mobile', '行動電話', 'Mobile', '手機', '聯絡電話']) || '')),
          fax: normalizeWhitespace(fax),
          email: normalizeWhitespace(email),
          website: normalizeWhitespace(website),
          serviceScope: normalizeWhitespace(String(pickValue(row, ['服務項目/Service Scope', '服務項目', 'Service Scope', '校正項目', '服務範圍', '校驗項目', '類別']) || '')),
          address: normalizeWhitespace(String(pickValue(row, ['地址/Address', '地址', 'Address']) || '')),
          notes,
        };
      }).filter(row => row.name);

      const mergedData = Array.from(
        parsedData.reduce((map, row) => {
          const key = row.vendorCode || row.name;
          const existing = map.get(key);

          if (!existing) {
            map.set(key, row);
            return map;
          }

          map.set(key, {
            ...existing,
            type: existing.type || row.type || defaultType,
            contact: mergeTextParts(existing.contact, row.contact),
            phone: mergeInlineValues(existing.phone, row.phone),
            mobile: mergeInlineValues(existing.mobile, row.mobile),
            fax: mergeInlineValues(existing.fax, row.fax),
            email: mergeInlineValues(existing.email, row.email),
            website: mergeInlineValues(existing.website, row.website),
            serviceScope: mergeTextParts(existing.serviceScope, row.serviceScope),
            address: mergeTextParts(existing.address, row.address),
            notes: mergeTextParts(existing.notes, row.notes),
          });

          return map;
        }, new Map<string, any>())
      ).map(([, value]) => value);

      if (mergedData.length === 0) {
        alert("Invalid file format or empty data.");
        return;
      }

      const res = await importVendorsAction(mergedData);
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
    <div className="flex items-center gap-3">
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
        className="flex items-center gap-2 px-4 py-2 bg-white text-slate-600 border border-slate-200 rounded-lg text-sm font-bold hover:bg-slate-50 transition-all shadow-sm disabled:opacity-50"
      >
        {isImporting ? <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" /> : <ArrowRight className="w-4 h-4 rotate-90" />}
        <span>{t('common.common.import')}</span>
      </button>
      <button 
        onClick={handleExport}
        className="flex items-center gap-2 px-4 py-2 bg-white text-slate-600 border border-slate-200 rounded-lg text-sm font-bold hover:bg-slate-50 transition-all shadow-sm"
      >
        <ArrowRight className="w-4 h-4 -rotate-90" />
        <span>{t('common.common.export')}</span>
      </button>
    </div>
  );
}
