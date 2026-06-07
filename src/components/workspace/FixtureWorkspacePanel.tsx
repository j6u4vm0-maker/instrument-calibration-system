"use client";

import { useMemo, useState } from "react";
import * as XLSX from "xlsx";
import { AlertCircle, Building2, ChevronDown, ChevronUp, Download } from "lucide-react";
import { formatLocaleDate } from "@/lib/date-format";

type FixturePanelKey = "total" | "overdue" | "due" | "completed";

type FixtureWorkspacePanelProps = {
  fixtures: any[];
  language: string;
  onOpenCalibration: (fixture: any) => void;
};

const COPY = {
  zh: {
    title: "檢具",
    description: "追蹤檢具校正任務與維護履歷。",
    total: "檢具總數",
    overdue: "逾期檢具",
    due: "本月待校檢具",
    completed: "已完成檢具",
    noData: "目前無資料",
    noPending: "目前沒有待校檢具",
    department: "部門",
    allDepartments: "全部部門",
    export: "匯出 Excel",
    id: "管理編號",
    name: "設備名稱",
    nextCalDate: "下次校正",
    status: "狀態",
    location: "存放位置",
    category: "類別",
    brand: "規格/廠牌",
    filenamePrefix: "檢具工作站",
    statusInUse: "使用中",
    statusScrapped: "報廢",
    statusDisabled: "停用",
    statusCompleted: "已完成",
    statusOverdue: "逾期",
    statusDue: "待校",
  },
  en: {
    title: "Fixtures",
    description: "Track fixture calibration tasks and maintenance history.",
    total: "Total Fixtures",
    overdue: "Overdue Fixtures",
    due: "Due This Month",
    completed: "Completed Fixtures",
    noData: "No data available",
    noPending: "No fixtures due this month",
    department: "Department",
    allDepartments: "All Departments",
    export: "Export Excel",
    id: "ID",
    name: "Name",
    nextCalDate: "Next Calibration",
    status: "Status",
    location: "Location",
    category: "Category",
    brand: "Spec/Brand",
    filenamePrefix: "FixtureWorkspace",
    statusInUse: "In Use",
    statusScrapped: "Scrapped",
    statusDisabled: "Disabled",
    statusCompleted: "Completed",
    statusOverdue: "Overdue",
    statusDue: "Due",
  },
} as const;

function getDepartmentName(fixture: any) {
  return fixture.departmentRef?.name || fixture.department || "";
}

function getLocationName(fixture: any) {
  return fixture.locationRef?.name || fixture.location || "";
}

function isRetiredFixture(fixture: any) {
  return ["SCRAPPED", "DISABLED", "INACTIVE", "停用", "報廢"].includes(fixture.status);
}

function isCompletedFixture(fixture: any) {
  const latestRecord = fixture.records?.[0];
  if (!latestRecord?.calDate) return false;

  const currentMonthStart = new Date();
  currentMonthStart.setDate(1);
  currentMonthStart.setHours(0, 0, 0, 0);

  return (
    new Date(latestRecord.calDate) >= currentMonthStart &&
    (latestRecord.status === "PENDING" || latestRecord.status === "APPROVED")
  );
}

function sortFixtures(items: any[]) {
  return [...items].sort((a, b) => {
    const aTime = a.nextCalDate ? new Date(a.nextCalDate).getTime() : Number.MAX_SAFE_INTEGER;
    const bTime = b.nextCalDate ? new Date(b.nextCalDate).getTime() : Number.MAX_SAFE_INTEGER;

    if (aTime !== bTime) return aTime - bTime;
    return String(a.id || "").localeCompare(String(b.id || ""));
  });
}

export default function FixtureWorkspacePanel({
  fixtures,
  language,
  onOpenCalibration,
}: FixtureWorkspacePanelProps) {
  const locale = language.startsWith("zh") ? "zh" : "en";
  const text = COPY[locale];
  const [activePanel, setActivePanel] = useState<FixturePanelKey>("due");
  const [selectedDepartment, setSelectedDepartment] = useState("ALL");

  const departmentOptions = useMemo(() => {
    const names = Array.from(
      new Set(fixtures.map(getDepartmentName).filter(Boolean))
    ).sort((a, b) => a.localeCompare(b));

    return ["ALL", ...names];
  }, [fixtures]);

  const fixtureGroups = useMemo(() => {
    const total = fixtures;
    const overdue = fixtures.filter(
      (fixture) =>
        fixture.calType !== "NO_CAL" &&
        !isRetiredFixture(fixture) &&
        fixture.calculatedStatus === "OVERDUE"
    );
    const due = fixtures.filter(
      (fixture) =>
        fixture.calType !== "NO_CAL" &&
        !isRetiredFixture(fixture) &&
        fixture.isDueThisMonth
    );
    const completed = fixtures.filter(
      (fixture) => fixture.calType !== "NO_CAL" && isCompletedFixture(fixture)
    );

    return { total, overdue, due, completed };
  }, [fixtures]);

  const panelMeta: Record<FixturePanelKey, { title: string; emptyText: string; count: number }> = {
    total: {
      title: text.total,
      emptyText: text.noData,
      count: fixtureGroups.total.length,
    },
    overdue: {
      title: text.overdue,
      emptyText: text.noData,
      count: fixtureGroups.overdue.length,
    },
    due: {
      title: text.due,
      emptyText: text.noPending,
      count: fixtureGroups.due.length,
    },
    completed: {
      title: text.completed,
      emptyText: text.noData,
      count: fixtureGroups.completed.length,
    },
  };

  const filteredFixtures = useMemo(() => {
    const source = fixtureGroups[activePanel];
    const departmentFiltered =
      selectedDepartment === "ALL"
        ? source
        : source.filter((fixture) => getDepartmentName(fixture) === selectedDepartment);

    return sortFixtures(departmentFiltered);
  }, [activePanel, fixtureGroups, selectedDepartment]);

  const getStatusLabel = (fixture: any) => {
    if (fixture.status === "SCRAPPED" || fixture.status === "報廢") return text.statusScrapped;
    if (fixture.status === "DISABLED" || fixture.status === "INACTIVE" || fixture.status === "停用") {
      return text.statusDisabled;
    }
    if (activePanel === "completed") return text.statusCompleted;
    if (activePanel === "overdue") return text.statusOverdue;
    if (activePanel === "due") return text.statusDue;
    if (fixture.status === "IN_USE") return text.statusInUse;
    return fixture.status || "-";
  };

  const exportFixtures = () => {
    const rows = filteredFixtures.map((fixture) => ({
      [text.id]: fixture.id || "",
      [text.name]: fixture.name || "",
      [text.department]: getDepartmentName(fixture),
      [text.category]: fixture.category || "",
      [text.brand]: fixture.brand || fixture.spec || "",
      [text.location]: getLocationName(fixture),
      [text.nextCalDate]: formatLocaleDate(fixture.nextCalDate, language),
      [text.status]: getStatusLabel(fixture),
    }));

    const sheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, sheet, "Fixtures");

    const dateStamp = new Date().toISOString().split("T")[0];
    const panelName = panelMeta[activePanel].title.replace(/\s+/g, "_");
    const departmentName =
      selectedDepartment === "ALL" ? text.allDepartments : selectedDepartment.replace(/\s+/g, "_");

    XLSX.writeFile(workbook, `${text.filenamePrefix}_${panelName}_${departmentName}_${dateStamp}.xlsx`);
  };

  return (
    <div className="bg-white rounded-3xl border border-white shadow-xl shadow-slate-200/40 overflow-hidden">
      <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-emerald-50/20 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800">{text.title}</h3>
            <p className="text-sm text-slate-500">{text.description}</p>
          </div>
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        {(["total", "overdue", "due", "completed"] as FixturePanelKey[]).map((panel) => {
          const colorMap = {
            total: "emerald",
            overdue: "red",
            due: "amber",
            completed: "blue",
          } as const;
          const color = colorMap[panel];
          const activeClasses = {
            emerald: "bg-emerald-100 border-emerald-300",
            red: "bg-red-100 border-red-300",
            amber: "bg-amber-100 border-amber-300",
            blue: "bg-blue-100 border-blue-300",
          }[color];
          const idleClasses = {
            emerald: "bg-emerald-50 border-emerald-100 hover:bg-emerald-100",
            red: "bg-red-50 border-red-100 hover:bg-red-100",
            amber: "bg-amber-50 border-amber-100 hover:bg-amber-100",
            blue: "bg-blue-50 border-blue-100 hover:bg-blue-100",
          }[color];
          const textClasses = {
            emerald: "text-emerald-700",
            red: "text-red-700",
            amber: "text-amber-700",
            blue: "text-blue-700",
          }[color];

          return (
            <button
              key={panel}
              type="button"
              onClick={() => setActivePanel(panel)}
              className={`rounded-2xl border p-4 text-left transition-colors ${
                activePanel === panel ? activeClasses : idleClasses
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className={`text-xs font-bold uppercase tracking-widest ${textClasses}`}>
                    {panelMeta[panel].title}
                  </div>
                  <div className="text-2xl font-black text-slate-800 mt-2">{panelMeta[panel].count}</div>
                </div>
                {activePanel === panel ? (
                  <ChevronUp className={`w-5 h-5 ${textClasses}`} />
                ) : (
                  <ChevronDown className={`w-5 h-5 ${textClasses}`} />
                )}
              </div>
            </button>
          );
        })}
      </div>

      <section className="px-6 pb-6">
        <div className="flex flex-col gap-4 mb-4 lg:flex-row lg:items-center lg:justify-between">
          <h4 className="font-bold text-slate-700 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-500" />
            {panelMeta[activePanel].title}
          </h4>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <span className="font-medium">{text.department}</span>
              <select
                value={selectedDepartment}
                onChange={(event) => setSelectedDepartment(event.target.value)}
                className="h-10 min-w-[180px] rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-kst-blue focus:ring-2 focus:ring-kst-blue/10"
              >
                <option value="ALL">{text.allDepartments}</option>
                {departmentOptions
                  .filter((option) => option !== "ALL")
                  .map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
              </select>
            </label>

            <button
              type="button"
              onClick={exportFixtures}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              <Download className="h-4 w-4" />
              {text.export}
            </button>
          </div>
        </div>

        {filteredFixtures.length === 0 ? (
          <div className="p-12 text-center border-2 border-dashed border-slate-200 rounded-2xl text-slate-400">
            {panelMeta[activePanel].emptyText}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-separate border-spacing-y-2">
              <thead className="bg-[#E2E8F0] text-[#7D7DFF] font-bold">
                <tr>
                  <th className="px-4 py-4 rounded-l-2xl">{text.id}</th>
                  <th className="px-4 py-4">{text.name}</th>
                  <th className="px-4 py-4">{text.department}</th>
                  <th className="px-4 py-4">{text.nextCalDate}</th>
                  <th className="px-4 py-4 rounded-r-2xl">{text.status}</th>
                </tr>
              </thead>
              <tbody>
                {filteredFixtures.slice(0, 50).map((fixture) => (
                  <tr key={fixture.id} className="bg-white hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-4 align-top">
                      <button
                        type="button"
                        onClick={() => onOpenCalibration(fixture)}
                        className="font-mono font-bold text-kst-blue hover:underline text-left"
                      >
                        {fixture.id}
                      </button>
                    </td>
                    <td className="px-4 py-4 text-slate-700 align-top">{fixture.name || "-"}</td>
                    <td className="px-4 py-4 text-slate-600 align-top">{getDepartmentName(fixture) || "-"}</td>
                    <td className="px-4 py-4 text-slate-600 align-top">
                      {formatLocaleDate(fixture.nextCalDate, language)}
                    </td>
                    <td className="px-4 py-4 text-slate-600 align-top">{getStatusLabel(fixture)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
