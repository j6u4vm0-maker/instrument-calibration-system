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
      "ID", "Name", "Category", "Spec", "Precision", 
      "UsageRange", "CalPoints", "Acceptance", "TAFLogo", 
      "Manager", "CalType", "Cycle(M)", "LastCalDate", 
      "NextCalDate", "Location", "Status", "Vendor", "Notes"
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
      gage.managerRef?.name || gage.manager || "",
      gage.calType || "",
      gage.calibrationCycle,
      gage.lastCalDate ? new Date(gage.lastCalDate).toLocaleDateString("zh-TW") : "",
      gage.nextCalDate ? new Date(gage.nextCalDate).toLocaleDateString("zh-TW") : "",
      gage.locationRef?.name || gage.location,
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
