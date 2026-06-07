"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

type FixtureDashboardItem = {
  id: string;
  name: string;
  nextCalDate: string | null;
  location: string;
  status: string;
  calType: string;
  latestRecordDate: string | null;
  latestRecordStatus: string | null;
};

type FixtureDashboardPanelProps = {
  fixtures: FixtureDashboardItem[];
};

type FixturePanelKey = "total" | "overdue" | "due" | "completed";

export default function FixtureDashboardPanel({ fixtures }: FixtureDashboardPanelProps) {
  const { t, language } = useLanguage();
  const [activePanel, setActivePanel] = useState<FixturePanelKey>("due");

  const displayLang = language === "zh-TW" ? "zh-TW" : "en-US";

  const isRetiredFixture = (fixture: FixtureDashboardItem) =>
    ["SCRAPPED", "DISABLED", "INACTIVE", "停用", "報廢"].includes(fixture.status);

  const isDueThisMonth = (fixture: FixtureDashboardItem) => {
    if (!fixture.nextCalDate) return false;
    const nextCal = new Date(fixture.nextCalDate);
    const now = new Date();
    return nextCal.getMonth() === now.getMonth() && nextCal.getFullYear() === now.getFullYear();
  };

  const isCompletedThisMonth = (fixture: FixtureDashboardItem) => {
    if (!fixture.latestRecordDate) return false;
    const currentMonthStart = new Date();
    currentMonthStart.setDate(1);
    currentMonthStart.setHours(0, 0, 0, 0);
    return new Date(fixture.latestRecordDate) >= currentMonthStart &&
      (fixture.latestRecordStatus === "PENDING" || fixture.latestRecordStatus === "APPROVED");
  };

  const fixtureLists = useMemo(() => {
    const total = fixtures;
    const overdue = fixtures.filter(
      (fixture) =>
        fixture.calType !== "NO_CAL" &&
        !isRetiredFixture(fixture) &&
        fixture.nextCalDate &&
        new Date(fixture.nextCalDate) < new Date()
    );
    const due = fixtures.filter((fixture) => fixture.calType !== "NO_CAL" && isDueThisMonth(fixture));
    const completed = fixtures.filter((fixture) => fixture.calType !== "NO_CAL" && isCompletedThisMonth(fixture));

    return { total, overdue, due, completed };
  }, [fixtures]);

  const panelMeta: Record<FixturePanelKey, { title: string; emptyText: string; accent: string }> = {
    total: {
      title: t("common.dash.fixture_total"),
      emptyText: t("common.common.no_data"),
      accent: "emerald",
    },
    overdue: {
      title: t("common.dash.fixture_overdue"),
      emptyText: t("common.common.no_data"),
      accent: "red",
    },
    due: {
      title: t("common.dash.fixture_due_this_month"),
      emptyText: t("calibration.cal.no_pending"),
      accent: "amber",
    },
    completed: {
      title: t("common.dash.fixture_completed"),
      emptyText: t("common.common.no_data"),
      accent: "blue",
    },
  };

  const activeItems = fixtureLists[activePanel];

  return (
    <div className="lg:col-span-3 bg-white rounded-3xl border border-white shadow-xl shadow-slate-200/40 overflow-hidden">
      <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-emerald-50/20">
        <h3 className="font-bold text-slate-800 flex items-center gap-3">
          <div className="w-8 h-8 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
            F
          </div>
          {t("common.dash.fixture_title")}
          <span className="bg-emerald-600 text-white text-xs px-2 py-0.5 rounded-full ml-1 font-bold">
            {fixtures.length}
          </span>
        </h3>
        <p className="text-sm text-slate-500">{t("common.dash.fixture_desc")}</p>
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <button
          type="button"
          onClick={() => setActivePanel("total")}
          className={`rounded-2xl border p-4 text-left transition-colors ${
            activePanel === "total" ? "bg-emerald-100 border-emerald-300" : "bg-emerald-50 border-emerald-100 hover:bg-emerald-100"
          }`}
        >
          <div className="text-xs font-bold text-emerald-700 uppercase tracking-widest">{t("common.dash.fixture_total")}</div>
          <div className="text-2xl font-black text-slate-800 mt-2">{fixtureLists.total.length}</div>
        </button>
        <button
          type="button"
          onClick={() => setActivePanel("overdue")}
          className={`rounded-2xl border p-4 text-left transition-colors ${
            activePanel === "overdue" ? "bg-red-100 border-red-300" : "bg-red-50 border-red-100 hover:bg-red-100"
          }`}
        >
          <div className="text-xs font-bold text-red-700 uppercase tracking-widest">{t("common.dash.fixture_overdue")}</div>
          <div className="text-2xl font-black text-slate-800 mt-2">{fixtureLists.overdue.length}</div>
        </button>
        <button
          type="button"
          onClick={() => setActivePanel("due")}
          className={`rounded-2xl border p-4 text-left transition-colors ${
            activePanel === "due" ? "bg-amber-100 border-amber-300" : "bg-amber-50 border-amber-100 hover:bg-amber-100"
          }`}
        >
          <div className="text-xs font-bold text-amber-700 uppercase tracking-widest">{t("common.dash.fixture_due_this_month")}</div>
          <div className="text-2xl font-black text-slate-800 mt-2">{fixtureLists.due.length}</div>
        </button>
        <button
          type="button"
          onClick={() => setActivePanel("completed")}
          className={`rounded-2xl border p-4 text-left transition-colors ${
            activePanel === "completed" ? "bg-blue-100 border-blue-300" : "bg-blue-50 border-blue-100 hover:bg-blue-100"
          }`}
        >
          <div className="text-xs font-bold text-blue-700 uppercase tracking-widest">{t("common.dash.fixture_completed")}</div>
          <div className="text-2xl font-black text-slate-800 mt-2">{fixtureLists.completed.length}</div>
        </button>
      </div>

      <div className="px-6 pb-6">
        <div className="space-y-4">
          <h4 className="font-bold text-slate-700 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            {panelMeta[activePanel].title}
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-separate border-spacing-y-2">
              <thead className="bg-[#E2E8F0] text-[#7D7DFF] font-bold">
                <tr>
                  <th className="px-4 py-3 rounded-l-2xl">{t("calibration.gage.id")}</th>
                  <th className="px-4 py-3">{t("calibration.gage.name")}</th>
                  <th className="px-4 py-3">{t("calibration.gage.next_cal")}</th>
                  <th className="px-4 py-3 rounded-r-2xl">{t("common.common.status")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {activeItems.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-slate-400 italic">
                      {panelMeta[activePanel].emptyText}
                    </td>
                  </tr>
                ) : (
                  activeItems.slice(0, 12).map((fixture) => (
                    <tr key={fixture.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-mono font-medium text-emerald-700 hover:underline">
                        <Link href={`/fixtures/${encodeURIComponent(fixture.id)}`}>{fixture.id}</Link>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{fixture.name || "-"}</td>
                      <td className="px-4 py-3 text-slate-600">
                        {fixture.nextCalDate ? new Date(fixture.nextCalDate).toLocaleDateString(displayLang) : "-"}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {activePanel === "overdue" ? t("common.status.overdue") : fixture.location || fixture.status || "-"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
