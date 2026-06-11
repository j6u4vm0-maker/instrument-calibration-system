"use client";

import { useState, useEffect, useMemo } from "react";
import { SearchableObjectSelect, SelectOption } from "./SearchableObjectSelect";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { getAllLocationsAction } from "@/app/actions/org-actions";
import { getAllVendorsAction } from "@/app/actions/vendor-actions";

interface GageOrganizationSelectorProps {
  initialData?: {
    custodianId?: string;
    departmentId?: string;
    locationId?: string;
    managerId?: string;
    rdIssuerId?: string;
    vendorId?: string;
  };
  onUpdate?: (data: any) => void;
  hideRdIssuer?: boolean;
}

export function GageOrganizationSelector({
  initialData,
  onUpdate,
  hideRdIssuer = false
}: GageOrganizationSelectorProps) {
  const { t } = useLanguage();
  const [orgData, setOrgData] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  
  // 內部狀態
  const [custId, setCustId] = useState(initialData?.custodianId || "");
  const [deptId, setDeptId] = useState(initialData?.departmentId || "");
  const [locId, setLocId] = useState(initialData?.locationId || "");
  const [mgrId, setMgrId] = useState(initialData?.managerId || "");
  const [rdIssuerId, setRdIssuerId] = useState(initialData?.rdIssuerId || "");
  const [vendorId, setVendorId] = useState(initialData?.vendorId || "");

  useEffect(() => {
    const loadData = async () => {
      const [orgs, vens] = await Promise.all([
        getAllLocationsAction(),
        getAllVendorsAction()
      ]);
      setOrgData(orgs);
      setVendors(vens);
    };
    loadData();
  }, []);

  // 當 initialData 改變時同步（用於編輯模式）
  useEffect(() => {
    if (initialData) {
      setCustId(initialData.custodianId || "");
      setDeptId(initialData.departmentId || "");
      setLocId(initialData.locationId || "");
      setMgrId(initialData.managerId || "");
      setRdIssuerId(initialData.rdIssuerId || "");
      setVendorId(initialData.vendorId || "");
    }
  }, [initialData]);

  const deptOptions = useMemo<SelectOption[]>(() => {
    if (!orgData || !Array.isArray(orgData)) return [];
    const options: SelectOption[] = [];
    orgData.forEach(loc => {
      if (loc.departments) {
        loc.departments.forEach((dept: any) => {
          options.push({
            label: dept.name,
            value: dept.id,
            subLabel: loc.name,
            type: 'dept'
          });
        });
      }
    });
    return options;
  }, [orgData]);

  const staffOptions = useMemo<SelectOption[]>(() => {
    if (!orgData || !Array.isArray(orgData)) return [];
    const options: SelectOption[] = [];
    orgData.forEach(loc => {
      if (loc.departments) {
        loc.departments.forEach((dept: any) => {
          if (dept.staff) {
            dept.staff.forEach((s: any) => {
              options.push({
                label: s.name,
                value: s.id,
                subLabel: `${loc.name} / ${dept.name}`,
                type: 'staff'
              });
            });
          }
        });
      }
    });
    return options;
  }, [orgData]);

  const vendorOptions = useMemo<SelectOption[]>(() => {
    return vendors.map(v => ({
      label: v.name,
      value: v.id,
      subLabel: v.contact || undefined,
      type: 'vendor'
    }));
  }, [vendors]);

  const showVendor = useMemo(() => {
    if (!deptId || !orgData) return false;
    let found = false;
    orgData.forEach(loc => {
      const d = loc.departments?.find((d: any) => d.id === deptId);
      if (d && d.name.includes("採購")) {
        found = true;
      }
    });
    return found;
  }, [deptId, orgData]);

  const handleDeptChange = (val: string) => {
    setDeptId(val);
    orgData.forEach(loc => {
      const d = loc.departments.find((d: any) => d.id === val);
      if (d) {
        setLocId(loc.id);
        const defaultInsp = loc.departments.flatMap((dept: any) => dept.staff).find((s: any) => s.isDefaultInspector);
        if (defaultInsp) setMgrId(defaultInsp.id);
      }
    });
    if (onUpdate) {
      onUpdate({ custId, deptId: val, locId, mgrId, rdIssuerId, vendorId });
    }
  };

  const handleCustodianChange = (val: string) => {
    setCustId(val);
    let newDeptId = deptId;
    let newLocId = locId;
    let newMgrId = mgrId;

    orgData.forEach(loc => {
      loc.departments.forEach((d: any) => {
        if (d.staff.some((s: any) => s.id === val)) {
          newLocId = loc.id;
          newDeptId = d.id;
          const defaultInsp = loc.departments.flatMap((dept: any) => dept.staff).find((s: any) => s.isDefaultInspector);
          if (defaultInsp) newMgrId = defaultInsp.id;
        }
      });
    });

    setLocId(newLocId);
    setDeptId(newDeptId);
    setMgrId(newMgrId);

    if (onUpdate) {
      onUpdate({ custId: val, deptId: newDeptId, locId: newLocId, mgrId: newMgrId, rdIssuerId, vendorId });
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {/* 隱藏欄位供 FormData 使用 */}
      <input type="hidden" name="locationId" value={locId} />
      <input type="hidden" name="departmentId" value={deptId} />
      <input type="hidden" name="custodianId" value={custId} />
      <input type="hidden" name="managerId" value={mgrId} />
      <input type="hidden" name="rdIssuerId" value={rdIssuerId} />
      <input type="hidden" name="vendorId" value={vendorId} />

      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-tight">
          部門 / 處別
        </label>
        <SearchableObjectSelect 
          options={deptOptions}
          value={deptId}
          placeholder="選擇部門/處別"
          onChange={handleDeptChange}
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-tight">
          {t('quality.org.custodian')}
        </label>
        <SearchableObjectSelect 
          options={staffOptions}
          value={custId}
          placeholder={t('quality.org.select_cust')}
          onChange={handleCustodianChange}
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-tight">
          {t('quality.org.cal_engineer')}
        </label>
        <SearchableObjectSelect 
          options={staffOptions}
          value={mgrId}
          placeholder={t('quality.org.select_mgr')}
          onChange={(val) => setMgrId(val)}
        />
      </div>

      {!hideRdIssuer && (
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-tight">
            RD發行人
          </label>
          <SearchableObjectSelect 
            options={staffOptions}
            value={rdIssuerId}
            placeholder="選擇RD發行人"
            onChange={(val) => setRdIssuerId(val)}
          />
        </div>
      )}

      {showVendor && (
        <div className="space-y-1.5 md:col-span-2">
          <label className="text-xs font-bold text-kst-blue uppercase tracking-tight flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-kst-blue animate-pulse" />
            採購專屬：供應商選擇
          </label>
          <SearchableObjectSelect 
            options={vendorOptions}
            value={vendorId}
            placeholder="請選擇供應商..."
            onChange={(val) => setVendorId(val)}
          />
        </div>
      )}
      
      {locId && (
        <div className="md:col-span-2 px-3 py-1 bg-blue-50/50 rounded-lg border border-blue-100/50 flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-kst-blue animate-pulse" />
          <span className="text-[10px] font-bold text-kst-blue/70 uppercase tracking-widest">
            {t('calibration.gage.location')}: {locId}
          </span>
        </div>
      )}
    </div>
  );
}
