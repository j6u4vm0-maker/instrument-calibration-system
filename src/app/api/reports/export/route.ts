import { GageService } from "@/services/gage-service";
import * as XLSX from "xlsx";

export async function GET() {
  try {
    const records = await GageService.getAllRecords();
    
    // Define headers
    const headers = [
      "ID", "GageID", "GageName", "CalDate", "Result", 
      "CertificateNo", "Inspector", "ReportType", "Vendor", "Cost", "Status"
    ];

    // Map records to rows
    const rows = records.map(record => [
      record.id,
      record.gageId,
      record.gage?.name || "",
      record.calDate ? new Date(record.calDate).toLocaleDateString("zh-TW") : "",
      record.result,
      record.certificateNo || "",
      record.inspector,
      record.reportType || "",
      record.vendor?.name || "Internal",
      record.cost || 0,
      record.status
    ]);

    // Create worksheet and workbook
    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "History");

    // Write workbook to buffer
    const buffer = XLSX.write(wb, { type: "array", bookType: "xlsx" });

    const filename = `CalibrationHistory_${new Date().toISOString().split('T')[0]}.xlsx`;

    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"; filename*=UTF-8''${encodeURIComponent(filename)}`,
        "Cache-Control": "no-cache"
      },
    });
  } catch (error) {
    console.error("History export failed:", error);
    return Response.json({ error: "Export failed" }, { status: 500 });
  }
}
