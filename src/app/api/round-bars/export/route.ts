import { RoundBarService } from "@/services/round-bar-service";
import * as XLSX from "xlsx";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const location = searchParams.get('location');
    
    let roundBars: any[] = await RoundBarService.getRoundBars();
    
    if (location) {
      roundBars = roundBars.filter(f => (f.locationRef?.name || f.location) === location);
    }
    
    // 欄位名稱設定為中英雙語，確保匯出後可正確匯回
    const headers = [
      "儀器設備編號/ID",
      "儀器設備名稱/Name",
      "廠牌規格/Spec",
      "使用範圍/UsageRange",
      "廠區/Location",
      "部門/Department",
      "管理者/Manager",
      "校正點1/CalPoint1",
      "校正點2/CalPoint2",
      "RD發行人/RDIssuer",
      "入廠日期/EntryDate",
      "校正週期(月)/Cycle",
      "上次校正日/LastCalDate",
      "下次校正日/NextCalDate",
      "狀態/Status",
      "備註/Notes"
    ];

    // Map roundBars to rows
    const rows = roundBars.map(bar => [
      bar.id,
      bar.name,
      bar.spec || "",
      bar.usageRange || "",
      bar.locationRef?.name || "",
      bar.departmentRef?.name || "",
      bar.managerRef?.name || "",
      bar.calPoint1 || "",
      bar.calPoint2 || "",
      bar.rdIssuer || "",
      bar.entryDate ? new Date(bar.entryDate).toISOString().split('T')[0] : "",
      bar.calibrationCycle,
      bar.lastCalDate ? new Date(bar.lastCalDate).toISOString().split('T')[0] : "",
      bar.nextCalDate ? new Date(bar.nextCalDate).toISOString().split('T')[0] : "",
      bar.status,
      bar.notes || "",
    ]);

    // Create worksheet and workbook
    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "RoundBars");

    // Write workbook to buffer
    const buffer = XLSX.write(wb, { type: "array", bookType: "xlsx" });

    const filename = location 
      ? `RoundBarList_${location}_${new Date().toISOString().split('T')[0]}.xlsx`
      : `RoundBarList_All_${new Date().toISOString().split('T')[0]}.xlsx`;

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
