"use server";

import { GageService } from "@/services/gage-service";
import { CalibrationService } from "@/services/calibration-service";
import { BatchService } from "@/services/batch-service";
import { DashboardService } from "@/services/dashboard-service";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { parse } from 'csv-parse/sync';
import iconv from 'iconv-lite';
import * as XLSX from 'xlsx';
import { prisma } from "@/lib/prisma";

export async function createGageAction(data: any) {
  try {
    const result = await GageService.createGage(data);
    revalidatePath("/gages");
    revalidatePath("/");
    return { success: true, data: result };
  } catch (error: any) {
    console.error("Failed to create gage:", error);
    // 檢查是否為 Prisma 的 Unique Constraint 錯誤
    if (error.code === 'P2002') {
      return { success: false, error: "這個設備編號 (ID) 已經存在，請更換一個編號。" };
    }
    return { success: false, error: error.message || "建立設備失敗" };
  }
}

export async function getCategoriesAction() {
  return await GageService.getCategories();
}

export async function createCategoryAction(name: string, description?: string) {
  try {
    const { CategoryService } = await import('@/services/category-service');
    const category = await CategoryService.createCategory(name.trim(), description);
    revalidatePath('/settings/standards');
    return { success: true, data: category };
  } catch (error: any) {
    console.error('Failed to create category:', error);
    return { success: false, error: error.message || '建立類別失敗' };
  }
}

export async function addCalibrationRecordAction(formData: FormData) {
  const gageId = formData.get("gageId") as string;
  const calDateStr = formData.get("calDate") as string;
  const result = formData.get("result") as string;
  const inspector = formData.get("inspector") as string;
  const reportType = formData.get("reportType") as string;
  const certificateNo = formData.get("certificateNo") as string;
  const notes = formData.get("notes") as string;
  const status = formData.get("status") as string; // DRAFT, PENDING, APPROVED
  const detailsStr = formData.get("details") as string; // JSON string of details
  const vendorId = formData.get("vendorId") as string;
  const cost = parseFloat(formData.get("cost") as string || "0");
  const nextCalDateStr = formData.get("nextCalDate") as string;
  const attachmentUrl = formData.get("attachmentUrl") as string;
  const calibrationCycle = parseInt(formData.get("calibrationCycle") as string || "0");

  if (!gageId || !calDateStr || !result || !inspector) {
    throw new Error("請填寫必要欄位");
  }

  let details = [];
  if (detailsStr) {
    try {
      const rawDetails = JSON.parse(detailsStr);
      if (Array.isArray(rawDetails)) {
        // Map legacy fields to schema fields
        details = rawDetails.map(d => ({
          category: d.category || d.type || "",
          point: String(d.point || ""),
          standard: d.standard !== undefined ? parseFloat(d.standard) : undefined,
          actual: d.actual !== undefined ? parseFloat(d.actual) : undefined,
          error: d.error !== undefined ? parseFloat(d.error) : undefined,
          result: d.result || "PASS"
        }));
      }
    } catch (e) {
      console.error("Failed to parse details", e);
    }
  }

  const newCalPoints = formData.get("newCalPoints") as string;

  await CalibrationService.addCalibrationRecord({
    gageId,
    calDate: new Date(calDateStr),
    result,
    inspector,
    reportType,
    certificateNo,
    notes,
    status,
    details,
    newCalPoints,
    vendorId: vendorId || undefined,
    cost: cost || 0,
    attachmentUrl,
    overrideNextCalDate: nextCalDateStr ? new Date(nextCalDateStr) : undefined,
    calibrationCycle: calibrationCycle > 0 ? calibrationCycle : undefined,
  });

  revalidatePath(`/gages/${encodeURIComponent(gageId)}`);
  revalidatePath("/gages");
  revalidatePath("/");
}

export async function importGagesAction(data: any[]) {
  const result = await GageService.bulkImportGages(data);
  revalidatePath("/gages");
  revalidatePath("/");
  return result;
}

export async function importRecordsAction(formData: FormData) {
  const file = formData.get("file") as File;
  if (!file) throw new Error("No file provided");

  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'buffer' });
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const records = XLSX.utils.sheet_to_json(worksheet) as any[];

  let importedCount = 0;

  for (const record of records) {
    const gageId = String(record.GageID || record['管理編號'] || record.gageId || "");
    if (!gageId) continue;

    // Verify gage exists
    const gage = await prisma.gage.findUnique({ where: { id: gageId } });
    if (!gage) continue;

    const calDateStr = record.CalDate || record['校正日期'] || record.calDate;
    const calDate = (calDateStr && !isNaN(Date.parse(calDateStr))) ? new Date(calDateStr) : new Date();

    await prisma.calibrationRecord.create({
      data: {
        gageId,
        calDate,
        result: record.Result || record['判定'] || "PASS",
        inspector: record.Inspector || record['校驗員'] || "SYSTEM",
        certificateNo: record.CertificateNo || record['報告編號'] || record.certificateNo,
        reportType: record.ReportType || record['報告類別'] || "EXTERNAL",
        notes: record.Notes || record['備註'] || record.notes,
        status: record.Status || record['狀態'] || "APPROVED",
        cost: parseFloat(record.Cost || record['費用'] || "0"),
      }
    });
    importedCount++;
  }

  revalidatePath("/reports");
  revalidatePath("/gages");
  revalidatePath("/");
  return { success: true, count: importedCount };
}

export async function updateGageStatusAction(id: string, status: string) {
  await prisma.gage.update({
    where: { id },
    data: { status }
  });
  revalidatePath("/gages");
  revalidatePath("/");
}

export async function updateGageAction(id: string, data: any) {
  try {
    const result = await GageService.updateGage(id, data);
    revalidatePath(`/gages/${encodeURIComponent(id)}`);
    revalidatePath("/gages");
    revalidatePath("/");
    return { success: true, data: result };
  } catch (error: any) {
    console.error("Failed to update gage:", error);
    return { success: false, error: error.message || "Failed to update instrument" };
  }
}

export async function deleteGageAction(id: string) {
  await GageService.deleteGage(id);
  revalidatePath("/gages");
  revalidatePath("/");
}

export async function batchCalibrationAction(data: {
  vendorId: string;
  totalCost: number;
  invoiceNo?: string;
  status?: string;
  items: {
    gageId: string;
    certificateNo?: string;
    result?: string;
    calibrationCycle: number;
    calDate: string;
  }[];
}) {
  await BatchService.addBatchCalibration(data);
  revalidatePath("/gages");
  revalidatePath("/batches");
  revalidatePath("/");
}

export async function finalizeBatchCalibrationAction(batchId: string, data: any) {
  await BatchService.finalizeBatchCalibration(batchId, data);
  revalidatePath("/gages");
  revalidatePath("/batches");
  revalidatePath(`/batches/${batchId}`);
  revalidatePath("/");
}

export async function updateCalibrationRecordAction(id: string, data: any) {
  const cookieStore = await cookies();
  const role = cookieStore.get('role')?.value;
  
  const existing = await CalibrationService.getRecordById(id);
  if (existing?.status === 'APPROVED' && role !== 'admin') {
    throw new Error("權限不足：只有系統管理員可以修改已審核的紀錄");
  }

  if (data.calDate) data.calDate = new Date(data.calDate);
  await CalibrationService.updateCalibrationRecord(id, data);
  revalidatePath("/reports");
  revalidatePath("/gages");
  revalidatePath("/");
}

export async function reviewCalibrationRecordAction(
  recordId: string, 
  decision: 'APPROVED' | 'REJECTED', 
  notes?: string
) {
  // 這裡假設從 Session/Context 取得審核者名稱，目前暫定為 "QA_MANAGER"
  await CalibrationService.reviewCalibrationRecord(recordId, "QA_MANAGER", decision, notes);
  revalidatePath("/reports");
  revalidatePath("/gages");
  revalidatePath("/");
}

export async function batchDeleteGagesAction(ids: string[]) {
  await GageService.batchDeleteGages(ids);
  revalidatePath("/gages");
  revalidatePath("/");
}

export async function batchUpdateGagesAction(ids: string[], data: any) {
  await GageService.batchUpdateGages(ids, data);
  revalidatePath("/gages");
  revalidatePath("/");
}

export async function batchDeleteRecordsAction(ids: string[]) {
  const cookieStore = await cookies();
  const role = cookieStore.get('role')?.value;

  if (role !== 'admin') {
    const records = await prisma.calibrationRecord.findMany({
      where: { id: { in: ids } },
      select: { status: true }
    });
    if (records.some(r => r.status === 'APPROVED')) {
      throw new Error("權限不足：您選取的紀錄中包含已審核的紀錄，只有系統管理員可以刪除已審核的紀錄");
    }
  }

  await CalibrationService.batchDeleteRecords(ids);
  revalidatePath("/reports");
  revalidatePath("/gages");
  revalidatePath("/");
}

export async function batchUpdateRecordsAction(ids: string[], data: any) {
  const cookieStore = await cookies();
  const role = cookieStore.get('role')?.value;

  if (role !== 'admin') {
    // Check if any of the records are APPROVED
    const records = await prisma.calibrationRecord.findMany({
      where: { id: { in: ids } },
      select: { status: true }
    });
    if (records.some(r => r.status === 'APPROVED')) {
      throw new Error("權限不足：您選取的紀錄中包含已審核的紀錄，只有系統管理員可以批次修改已審核的紀錄");
    }
  }

  await CalibrationService.batchUpdateRecords(ids, data);
  revalidatePath("/reports");
  revalidatePath("/gages");
  revalidatePath("/");
}
export async function getMasterGagesAction() {
  const allGages = await GageService.getAllGages();
  // Filter for master gages (convention: category contains 'Standard' or '主標準')
  return allGages.filter(g => 
    g.category?.toLowerCase().includes('standard') || 
    g.category?.includes('標準') ||
    g.category?.includes('母儀')
  );
}
