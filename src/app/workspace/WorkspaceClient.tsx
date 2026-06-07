"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Hammer,
  MapPin,
  ScanLine,
} from "lucide-react";
import CalibrationModal from "@/components/CalibrationModal";
import FixtureWorkspacePanel from "@/components/workspace/FixtureWorkspacePanel";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { formatLocaleDate } from "@/lib/date-format";

type WorkspaceClientProps = {
  initialData: any;
  fixtureData?: any[];
  vendors: any[];
  language: string;
};

const WORKSPACE_COPY = {
  zh: {
    title: "校正工作站",
    description: "集中掃描、查看並執行量具與檢具校正作業。",
    placeholder: "掃描或輸入量具 / 檢具編號...",
    search: "搜尋",
    tabs: {
      overview: "總覽",
      external: "外校",
      internal: "內校",
    },
    pending: "待校正項目",
    notFound: "找不到檢具或量具編號：",
    inUse: "使用中",
    overdue: "逾期",
    completed: "已完成",
    noData: "目前無資料",
  },
  en: {
    title: "Workspace",
    description: "Scan, review, and calibrate gages and fixtures in one place.",
    placeholder: "Scan or enter gage / fixture ID...",
    search: "Search",
    tabs: {
      overview: "Overview",
      external: "External",
      internal: "Internal",
    },
    pending: "Pending Calibration",
    notFound: "Asset not found: ",
    inUse: "In Use",
    overdue: "Overdue",
    completed: "Completed",
    noData: "No data available",
  },
} as const;

export default function WorkspaceClient({
  initialData,
  fixtureData = [],
  vendors,
  language,
}: WorkspaceClientProps) {
  const { t } = useLanguage();
  const locale = language.startsWith("zh") ? "zh" : "en";
  const copy = WORKSPACE_COPY[locale];
  const [activeTab, setActiveTab] = useState<"OVERVIEW" | "EXTERNAL" | "INTERNAL">("OVERVIEW");
  const [scanQuery, setScanQuery] = useState("");
  const [calibratingAsset, setCalibratingAsset] = useState<any>(null);
  const scanInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!calibratingAsset) {
      scanInputRef.current?.focus();
    }
  }, [calibratingAsset]);

  const allGages = useMemo(
    () => [...initialData.incompleteGages, ...initialData.completedGages],
    [initialData.completedGages, initialData.incompleteGages]
  );

  const allFixtures = useMemo(() => [...fixtureData], [fixtureData]);

  const getAssetLocation = (asset: any) => asset.locationRef?.name || asset.location || "";

  const handleOpenCalibration = (asset: any) => {
    setCalibratingAsset(asset);
  };

  const handleScanSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!scanQuery.trim()) return;

    const keyword = scanQuery.trim().toLowerCase();
    const match = [...allGages, ...allFixtures].find(
      (asset) => asset.id?.toLowerCase() === keyword
    );

    if (match) {
      setCalibratingAsset(match);
    } else {
      alert(`${copy.notFound}${scanQuery}`);
    }

    setScanQuery("");
  };

  const renderAssetCard = (asset: any, isCompleted: boolean) => {
    const isOverdue =
      !isCompleted &&
      asset.nextCalDate &&
      new Date(asset.nextCalDate).getTime() < Date.now();

    return (
      <button
        key={asset.id}
        type="button"
        className={`w-full rounded-xl border bg-white p-4 text-left shadow-sm transition-all hover:shadow-md ${
          isCompleted ? "border-emerald-100" : isOverdue ? "border-red-100" : "border-slate-100"
        }`}
        onClick={() => handleOpenCalibration(asset)}
      >
        <div className="flex items-start gap-3">
          <div
            className={`mt-1 rounded-lg p-2 ${
              isCompleted
                ? "bg-emerald-50 text-emerald-600"
                : isOverdue
                  ? "bg-red-50 text-red-600"
                  : "bg-slate-50 text-slate-400"
            }`}
          >
            {isCompleted ? (
              <CheckCircle2 className="h-5 w-5" />
            ) : isOverdue ? (
              <AlertCircle className="h-5 w-5" />
            ) : (
              <Clock className="h-5 w-5" />
            )}
          </div>
          <div>
            <div className="font-bold text-slate-800">{asset.name}</div>
            <div className="text-xs font-mono text-slate-500">{asset.id}</div>
            <div className="mt-2 flex flex-wrap gap-4 text-xs text-slate-500">
              {asset.nextCalDate && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {formatLocaleDate(asset.nextCalDate, language)}
                </div>
              )}
              {getAssetLocation(asset) && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {getAssetLocation(asset)}
                </div>
              )}
            </div>
          </div>
        </div>
      </button>
    );
  };

  const renderGroupedSection = (groups: Record<string, any[]>, icon: "vendor" | "location") => {
    const entries = Object.entries(groups);

    if (entries.length === 0) {
      return (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center text-slate-400">
          {copy.noData}
        </div>
      );
    }

    return (
      <div className="space-y-8">
        {entries.map(([groupName, assets]) => (
          <div key={groupName} className="rounded-2xl border border-slate-100 bg-slate-50 p-6">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-800">
              {icon === "vendor" ? (
                <Building2 className="h-6 w-6 text-indigo-500" />
              ) : (
                <MapPin className="h-6 w-6 text-emerald-500" />
              )}
              {groupName}
              <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-sm font-normal text-slate-500">
                {assets.length}
              </span>
            </h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {assets.map((asset: any) => renderAssetCard(asset, false))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-3 text-3xl font-black text-slate-800">
            <Hammer className="h-8 w-8 text-kst-blue" />
            {copy.title}
          </h1>
          <p className="mt-2 text-slate-500">{copy.description}</p>
        </div>
      </header>

      <form onSubmit={handleScanSubmit} className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-6">
          <ScanLine className="h-8 w-8 text-kst-blue" />
        </div>
        <input
          ref={scanInputRef}
          type="text"
          value={scanQuery}
          onChange={(event) => setScanQuery(event.target.value)}
          placeholder={copy.placeholder}
          className="w-full rounded-2xl border-2 border-kst-blue/20 bg-white py-6 pl-20 pr-6 text-xl font-mono shadow-sm transition-all placeholder:font-sans placeholder:text-slate-300 focus:border-kst-blue focus:outline-none focus:ring-4 focus:ring-kst-blue/10"
          autoFocus
        />
        <button
          type="submit"
          className="absolute inset-y-2 right-2 rounded-xl bg-kst-blue px-6 font-bold text-white transition-colors hover:bg-blue-700"
        >
          {copy.search}
        </button>
      </form>

      <div className="space-y-6">
        <div className="rounded-3xl border border-white bg-white p-6 shadow-xl shadow-slate-200/40">
          <div className="flex space-x-2 border-b border-slate-200">
            {(["OVERVIEW", "EXTERNAL", "INTERNAL"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`border-b-2 px-6 py-3 text-sm font-bold transition-colors ${
                  activeTab === tab
                    ? "border-kst-blue text-kst-blue"
                    : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700"
                }`}
              >
                {tab === "OVERVIEW" && copy.tabs.overview}
                {tab === "EXTERNAL" && copy.tabs.external}
                {tab === "INTERNAL" && copy.tabs.internal}
              </button>
            ))}
          </div>

          <div className="min-h-[400px] pt-6">
            {activeTab === "OVERVIEW" && (
              <div className="space-y-4">
                <h3 className="flex items-center gap-2 font-bold text-slate-700">
                  <AlertCircle className="h-5 w-5 text-amber-500" />
                  {copy.pending} ({initialData.incompleteGages.length})
                </h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {initialData.incompleteGages.map((gage: any) => renderAssetCard(gage, false))}
                  {initialData.incompleteGages.length === 0 && (
                    <div className="col-span-2 rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center text-slate-400">
                      {t("calibration.cal.no_pending")}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "EXTERNAL" && renderGroupedSection(initialData.externalGrouped, "vendor")}
            {activeTab === "INTERNAL" && renderGroupedSection(initialData.internalGrouped, "location")}
          </div>
        </div>

        <FixtureWorkspacePanel
          fixtures={allFixtures}
          language={language}
          onOpenCalibration={handleOpenCalibration}
        />
      </div>

      {calibratingAsset && (
        <CalibrationModal
          isOpenExternal={true}
          gageId={calibratingAsset.id}
          calPoints={calibratingAsset.calPoints || ""}
          acceptance={calibratingAsset.acceptance || ""}
          calibrationCycle={calibratingAsset.calibrationCycle}
          acceptanceStandard={calibratingAsset.acceptanceStandard}
          vendors={vendors}
          onClose={() => setCalibratingAsset(null)}
        />
      )}
    </div>
  );
}
