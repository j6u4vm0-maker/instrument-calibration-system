import React from "react";
import Link from "next/link";
import { AlertTriangle, ShieldCheck } from "lucide-react";
import { GageService } from "@/services/gage-service";
import { DashboardService } from "@/services/dashboard-service";
import { FixtureService } from "@/services/fixture-service";
import { getTranslation } from "@/lib/i18n/server-translations";
import { prisma } from "@/lib/prisma";
import DailyEnvironmentWidget from "@/components/DailyEnvironmentWidget";
import FixtureDashboardPanel from "@/components/FixtureDashboardPanel";

export default async function Home() {
  const { t, language } = await getTranslation();
  const stats = await DashboardService.getDashboardStats();
  const allGages = await GageService.getAllGages();
  const allFixtures = await FixtureService.getAllFixtures();
  const gagesDueThisMonth = await DashboardService.getGagesDueThisMonth();

  const pendingReviewReports = await prisma.calibrationRecord.findMany({
    where: { status: "PENDING" },
    include: { gage: true, details: true },
    orderBy: { calDate: "desc" },
    take: 3,
  });

  const sanitizedReports = pendingReviewReports.map((report) => ({
    id: report.id,
    calDate: report.calDate.toISOString(),
    gageId: report.gageId,
    gageName: (report.gage as any)?.name || "Unknown",
    inspector: report.inspector,
  }));

  const upcomingGages = [...allGages]
    .sort((a, b) => new Date(a.nextCalDate).getTime() - new Date(b.nextCalDate).getTime())
    .slice(0, 5)
    .map((gage) => ({
      id: gage.id,
      name: gage.name,
      nextCalDate: gage.nextCalDate.toISOString(),
      calculatedStatus: (gage as any).calculatedStatus,
    }));

  const fixtureDashboardItems = allFixtures.map((fixture: any) => ({
    id: fixture.id,
    name: fixture.name,
    nextCalDate: fixture.nextCalDate ? new Date(fixture.nextCalDate).toISOString() : null,
    location: fixture.locationRef?.name || fixture.location || "",
    status: fixture.status || "",
    calType: fixture.calType || "",
    latestRecordDate: fixture.records?.[0]?.calDate
      ? new Date(fixture.records[0].calDate).toISOString()
      : null,
    latestRecordStatus: fixture.records?.[0]?.status || null,
  }));

  const displayLang = language === "zh-TW" ? "zh-TW" : "en-US";

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-kst-blue">{t("common.nav.dashboard")}</h1>
          <p className="text-slate-500 mt-2">{t("common.dash.welcome")}</p>
        </div>
        <div className="flex items-center gap-3">
          <DailyEnvironmentWidget />
          <div className="text-sm text-slate-400 bg-white px-4 py-2 rounded-lg border border-slate-100 shadow-sm h-[38px] flex items-center">
            {t("common.dash.last_updated")} {new Date().toLocaleString(displayLang)}
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-[#5A738E] p-6 rounded-3xl border border-[#4A637E] shadow-xl shadow-[#5A738E]/20 space-y-4">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-white/10 rounded-2xl text-lg text-white">C</div>
            <span className="text-xs font-bold text-[#5A738E] bg-white px-3 py-1 rounded-full shadow-sm">
              {t("common.dash.compliance")}
            </span>
          </div>
          <div>
            <div className="text-3xl font-black text-white">{stats.complianceRate}%</div>
            <div className="text-sm font-medium text-white/80 mt-1">{t("common.dash.compliance")}</div>
          </div>
          <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-[#A3E6D0] h-full transition-all duration-500"
              style={{ width: `${stats.complianceRate}%` }}
            />
          </div>
        </div>

        <div className="bg-[#5A738E] p-6 rounded-3xl border border-[#4A637E] shadow-xl shadow-[#5A738E]/20 space-y-4">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-white/10 rounded-2xl text-lg text-white">T</div>
            <span className="text-xs font-bold text-[#5A738E] bg-[#A3E6D0] px-3 py-1 rounded-full shadow-sm">
              {t("common.dash.total")}
            </span>
          </div>
          <div>
            <div className="text-3xl font-black text-white">{stats.total}</div>
            <div className="text-sm font-medium text-white/80 mt-1">{t("common.dash.total")}</div>
          </div>
        </div>

        <Link
          href="/reports"
          className="block bg-[#5A738E] p-6 rounded-3xl border border-[#4A637E] shadow-xl shadow-[#5A738E]/20 space-y-4 hover:shadow-2xl hover:shadow-[#5A738E]/40 hover:-translate-y-1 transition-all cursor-pointer"
        >
          <div className="flex justify-between items-start">
            <div className="p-3 bg-white/10 rounded-2xl text-lg text-white">R</div>
            <span className="text-xs font-bold text-[#5A738E] bg-[#FDE68A] px-3 py-1 rounded-full shadow-sm uppercase">
              {t("common.status.pending")}
            </span>
          </div>
          <div>
            <div className="text-3xl font-black text-white">{stats.pendingReviewCount || 0}</div>
            <div className="text-sm font-medium text-white/80 mt-1">{t("calibration.cal.review_list")}</div>
          </div>
        </Link>

        <Link
          href="/gages?status=OVERDUE"
          className="block bg-[#5A738E] p-6 rounded-3xl border border-[#4A637E] shadow-xl shadow-[#5A738E]/20 space-y-4 hover:shadow-2xl hover:shadow-[#5A738E]/40 hover:-translate-y-1 transition-all cursor-pointer"
        >
          <div className="flex justify-between items-start">
            <div className="p-3 bg-white/10 rounded-2xl text-lg text-white">O</div>
            <span className="text-xs font-bold text-[#5A738E] bg-[#FECACA] px-3 py-1 rounded-full shadow-sm">
              {t("common.dash.overdue")}
            </span>
          </div>
          <div>
            <div className="text-3xl font-black text-white">{stats.overdueCount}</div>
            <div className="text-sm font-medium text-white/80 mt-1">{t("common.dash.overdue")}</div>
          </div>
        </Link>

        <Link
          href="/workspace"
          className="block bg-[#5A738E] p-6 rounded-3xl border border-[#4A637E] shadow-xl shadow-[#5A738E]/20 space-y-4 hover:shadow-2xl hover:shadow-[#5A738E]/40 hover:-translate-y-1 transition-all cursor-pointer"
        >
          <div className="flex justify-between items-start">
            <div className="p-3 bg-white/10 rounded-2xl text-lg text-white">M</div>
            <span className="text-xs font-bold text-[#5A738E] bg-[#E0E7FF] px-3 py-1 rounded-full shadow-sm">
              {t("common.dash.this_month")}
            </span>
          </div>
          <div>
            <div className="text-3xl font-black text-white">{stats.dueThisMonthCount}</div>
            <div className="text-sm font-medium text-white/80 mt-1">{t("common.dash.this_month")}</div>
          </div>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-3 bg-white rounded-3xl border border-white shadow-xl shadow-slate-200/40 overflow-hidden">
          <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-amber-50/10">
            <h3 className="font-bold text-slate-800 flex items-center gap-3">
              <div className="w-8 h-8 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600">!</div>
              {t("common.status.pending")}
              <span className="bg-amber-600 text-white text-xs px-2 py-0.5 rounded-full ml-1 font-bold">
                {stats.pendingReviewCount}
              </span>
            </h3>
            <a href="/reports" className="text-sm text-indigo-600 hover:underline flex items-center font-bold">
              {t("common.dash.view_all")}
            </a>
          </div>
          {sanitizedReports.length > 0 ? (
            <div className="px-6 pb-6 overflow-x-auto">
              <table className="w-full text-left text-sm border-separate border-spacing-y-2">
                <thead className="bg-[#E2E8F0] text-[#7D7DFF] font-bold">
                  <tr>
                    <th className="px-6 py-4 rounded-l-2xl">{t("calibration.gage.id")}</th>
                    <th className="px-6 py-4">{t("calibration.gage.name")}</th>
                    <th className="px-6 py-4">{t("calibration.cal.report_date")}</th>
                    <th className="px-6 py-4 rounded-r-2xl">{t("calibration.cal.inspector_label")}</th>
                  </tr>
                </thead>
                <tbody className="space-y-2">
                  {sanitizedReports.map((report) => (
                    <tr key={report.id} className="hover:bg-amber-50/30 transition-colors">
                      <td className="px-6 py-4 font-mono font-medium text-amber-700 hover:underline">
                        <Link href={`/gages/${encodeURIComponent(report.gageId)}`}>{report.gageId}</Link>
                      </td>
                      <td className="px-6 py-4 text-slate-600">{report.gageName}</td>
                      <td className="px-6 py-4 text-slate-600">
                        {new Date(report.calDate).toLocaleDateString(displayLang)}
                      </td>
                      <td className="px-6 py-4 text-slate-600">{report.inspector || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-amber-500/70 italic text-sm flex flex-col items-center justify-center gap-2">
              <ShieldCheck className="w-8 h-8 opacity-50 mb-1" />
              {t("common.common.no_data")}
            </div>
          )}
        </div>

        <div className="lg:col-span-3 bg-white rounded-3xl border border-white shadow-xl shadow-slate-200/40 overflow-hidden">
          <div className="p-6 border-b border-slate-50 flex justify-between items-center">
            <h3 className="font-bold text-slate-800 flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">M</div>
              {t("common.dash.this_month")}
              <span className="bg-indigo-600 text-white text-xs px-2 py-0.5 rounded-full ml-1 font-bold">
                {gagesDueThisMonth.length}
              </span>
            </h3>
          </div>
          <div className="px-6 pb-6 overflow-x-auto">
            <table className="w-full text-left text-sm border-separate border-spacing-y-2">
              <thead className="bg-[#E2E8F0] text-[#7D7DFF] font-bold">
                <tr>
                  <th className="px-6 py-4 rounded-l-2xl">{t("calibration.gage.id")}</th>
                  <th className="px-6 py-4">{t("calibration.gage.name")}</th>
                  <th className="px-6 py-4">{t("calibration.gage.next_cal")}</th>
                  <th className="px-6 py-4 rounded-r-2xl">{t("common.common.status")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {gagesDueThisMonth.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-10 text-center text-slate-400 italic">
                      {t("calibration.cal.no_pending")}
                    </td>
                  </tr>
                ) : (
                  gagesDueThisMonth.slice(0, 5).map((gage: any) => (
                    <tr key={gage.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-mono font-medium text-kst-blue hover:underline">
                        <Link href={`/gages/${encodeURIComponent(gage.id)}`}>{gage.id}</Link>
                      </td>
                      <td className="px-6 py-4 text-slate-600">{gage.name}</td>
                      <td className="px-6 py-4 text-slate-600">
                        {new Date(gage.nextCalDate).toLocaleDateString(displayLang)}
                      </td>
                      <td className="px-6 py-4">
                        {gage.calculatedStatus === "PASS" && (
                          <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full text-xs font-bold">
                            {t("common.status.pass")}
                          </span>
                        )}
                        {gage.calculatedStatus === "WARNING" && (
                          <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded-full text-xs font-bold">
                            {t("common.status.warning")}
                          </span>
                        )}
                        {gage.calculatedStatus === "OVERDUE" && (
                          <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-bold">
                            {t("common.status.overdue")}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="lg:col-span-3 bg-white rounded-3xl border border-white shadow-xl shadow-slate-200/40 overflow-hidden">
          <div className="p-6 border-b border-slate-50 flex justify-between items-center">
            <h3 className="font-bold text-slate-800 flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">R</div>
              {t("common.dash.recent")}
            </h3>
            <a href="/gages" className="text-sm text-indigo-600 hover:underline flex items-center font-bold">
              {t("common.dash.view_all")}
            </a>
          </div>
          <div className="px-6 pb-6 overflow-x-auto">
            <table className="w-full text-left text-sm border-separate border-spacing-y-2">
              <thead className="bg-[#E2E8F0] text-[#7D7DFF] font-bold">
                <tr>
                  <th className="px-6 py-4 rounded-l-2xl">{t("calibration.gage.id")}</th>
                  <th className="px-6 py-4">{t("calibration.gage.name")}</th>
                  <th className="px-6 py-4">{t("calibration.gage.next_cal")}</th>
                  <th className="px-6 py-4 rounded-r-2xl">{t("common.common.status")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {upcomingGages.map((gage: any) => (
                  <tr key={gage.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-mono font-medium text-kst-blue hover:underline">
                      <Link href={`/gages/${encodeURIComponent(gage.id)}`}>{gage.id}</Link>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{gage.name}</td>
                    <td className="px-6 py-4 text-slate-600">
                      {new Date(gage.nextCalDate).toLocaleDateString(displayLang)}
                    </td>
                    <td className="px-6 py-4">
                      {gage.calculatedStatus === "PASS" && (
                        <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full text-xs font-bold">
                          {t("common.status.pass")}
                        </span>
                      )}
                      {gage.calculatedStatus === "WARNING" && (
                        <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded-full text-xs font-bold">
                          {t("common.status.warning")}
                        </span>
                      )}
                      {gage.calculatedStatus === "OVERDUE" && (
                        <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-bold">
                          {t("common.status.overdue")}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <FixtureDashboardPanel fixtures={fixtureDashboardItems} />
      </div>
    </div>
  );
}
