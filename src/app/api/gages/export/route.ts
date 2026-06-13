import { GageService } from "@/services/gage-service";
import * as XLSX from "xlsx";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const location = searchParams.get('location');
    
    let gages = await GageService.getAllGages();
    
    if (location) {
      gages = gages.filter(g => (g.locationRef?.name || g.location) === location);
    }
    
    // Define headers
    const headers = [
      "儀器設備編號/ID", "儀器設備名稱/Name", "類別/Category", "廠牌規格/Spec", "精度/Precision", 
      "使用範圍/UsageRange", "校正點位/CalPoints", "校驗標準/Acceptance", "TAF Logo", 
      "廠區/Location", "部門/Department", "管理者/Manager", "保管人/Custodian", 
      "校正類別/CalType", "校正週期(月)/Cycle", "入廠日期/EntryDate", "上次校正日/LastCalDate", 
      "下次校正日/NextCalDate", "狀態/Status", "供應商/Vendor", "備註/Notes"
    ];

    // Map gages to rows
    const rows = gages.map(gage => [
      gage.id,
      gage.name,
      gage.category,
      gage.spec || "",
      gage.precision || "",
      gage.usageRange || "",
      gage.calPoints || "",
      gage.acceptance || "",
      gage.tafLogo || "",
      gage.locationRef?.name || gage.location,
      gage.departmentRef?.name || gage.department || "",
      gage.managerRef?.name || gage.manager || "",
      gage.custodianRef?.name || "",
      gage.calType || "",
      gage.calibrationCycle,
      gage.entryDate ? new Date(gage.entryDate).toLocaleDateString("zh-TW") : "",
      gage.lastCalDate ? new Date(gage.lastCalDate).toLocaleDateString("zh-TW") : "",
      gage.nextCalDate ? new Date(gage.nextCalDate).toLocaleDateString("zh-TW") : "",
      gage.status,
      gage.vendorRef?.name || gage.vendorId || "",
      gage.notes || ""
    ]);

    // Create worksheet and workbook
    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Gages");

    // Write workbook to buffer
    const buffer = XLSX.write(wb, { type: "array", bookType: "xlsx" });

    const filename = location 
      ? `GageList_${location}_${new Date().toISOString().split('T')[0]}.xlsx`
      : `GageList_All_${new Date().toISOString().split('T')[0]}.xlsx`;

    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"; filename*=UTF-8''${encodeURIComponent(filename)}`,
        "Cache-Control": "no-cache"
      },
    });
  } catch (error) {
    console.error("Export failed:", error);
    return Response.json({ error: "Export failed" }, { status: 500 });
  }
}
