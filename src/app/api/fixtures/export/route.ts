import { FixtureService } from "@/services/fixture-service";
import * as XLSX from "xlsx";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const location = searchParams.get('location');
    
    let fixtures: any[] = await FixtureService.getAllFixtures();
    
    if (location) {
      fixtures = fixtures.filter(f => (f.locationRef?.name || f.location) === location);
    }
    
    // 欄位名稱與匯入程式碼 (FixtureImportExportButtons) 完全對齊，確保匯出後可正確匯回
    const headers = [
      "管理編號/ID",              // → id
      "設備名稱/Name",            // → name
      "版次序號/SerialNo",        // → serialNo (額外資訊欄，匯入時不處理)
      "適用料號/ApplicablePart",  // → applicablePart (額外資訊欄)
      "對應圖號/DrawingNo",       // → drawingNo (額外資訊欄)
      "使用說明書/Manual",        // → manual (額外資訊欄)
      "廠牌規格/Spec",            // → spec/brand
      "類別/Category",            // → category
      "廠區/Location",            // → location
      "部門/Department",          // → department
      "保管人/Custodian",         // → custodian
      "管理者/Manager",           // → manager (額外資訊欄)
      "RD發行人/RDIssuer",        // → rdIssuer (額外資訊欄)
      "精度/Precision",           // → precision
      "校正點/CalPoints",         // → calPoints
      "允收標準/Acceptance",      // → acceptance
      "TAF Logo",                 // → tafLogo
      "入廠日期/EntryDate",       // → entryDate
      "校正類別/CalType",         // → calType
      "校正週期(月)/Cycle",       // → calibrationCycle
      "上次校正/LastCalDate",     // → lastCalDate
      "下次校正/NextCalDate",     // → nextCalDate
      "下次校正月/NextCalMonth",  // → nextCalMonth (額外資訊欄)
      "狀態/Status",              // → status
      "備註/Notes",               // → notes
    ];

    // Map fixtures to rows（欄位順序與 headers 完全對應）
    const rows = fixtures.map(fixture => [
      fixture.id,
      fixture.name,
      fixture.serialNo || "",
      fixture.applicablePart || "",
      fixture.drawingNo || "",
      fixture.manual || "",
      fixture.brand || "",
      fixture.categoryRef?.name || fixture.category || "",
      fixture.locationRef?.name || "",
      fixture.departmentRef?.name || "",
      fixture.custodianRef?.name || "",
      fixture.managerRef?.name || fixture.manager || "",
      fixture.rdIssuerRef?.name || "",
      fixture.precision || "",
      fixture.calPoints || "",
      fixture.acceptance || "",
      fixture.tafLogo || "",
      fixture.entryDate ? new Date(fixture.entryDate).toISOString().split('T')[0] : "",
      fixture.calType || "INTERNAL",
      fixture.calibrationCycle,
      fixture.lastCalDate ? new Date(fixture.lastCalDate).toISOString().split('T')[0] : "",
      fixture.nextCalDate ? new Date(fixture.nextCalDate).toISOString().split('T')[0] : "",
      fixture.nextCalMonth || "",
      fixture.status,
      fixture.notes || "",
    ]);

    // Create worksheet and workbook
    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Fixtures");

    // Write workbook to buffer
    const buffer = XLSX.write(wb, { type: "array", bookType: "xlsx" });

    const filename = location 
      ? `FixtureList_${location}_${new Date().toISOString().split('T')[0]}.xlsx`
      : `FixtureList_All_${new Date().toISOString().split('T')[0]}.xlsx`;

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
