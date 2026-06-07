'use server';

import { StandardService } from "@/services/standard-service";
import { revalidatePath } from "next/cache";

export async function createStandardAction(data: any) {
  try {
    const result = await StandardService.createAcceptanceStandard(data);
    revalidatePath('/settings');
    revalidatePath('/settings/standards');
    revalidatePath('/data-management');
    return { success: true, data: result };
  } catch (error) {
    console.error("Failed to create standard:", error);
    return { success: false, error: "Failed to create standard" };
  }
}

export async function updateStandardAction(id: string, data: any) {
  try {
    const result = await StandardService.updateAcceptanceStandard(id, data);
    revalidatePath('/settings');
    revalidatePath('/settings/standards');
    revalidatePath('/data-management');
    revalidatePath('/');
    return { success: true, data: result };
  } catch (error) {
    console.error("Failed to update standard:", error);
    return { success: false, error: "Failed to update standard" };
  }
}

export async function deleteStandardAction(id: string) {
  try {
    await StandardService.deleteAcceptanceStandard(id);
    revalidatePath('/settings');
    revalidatePath('/settings/standards');
    return { success: true };
  } catch (error) {
    console.error("Failed to delete standard:", error);
    return { success: false, error: "Failed to delete standard" };
  }
}

export async function getAllAcceptanceStandardsAction() {
  try {
    return await StandardService.getAllAcceptanceStandards();
  } catch (error) {
    console.error("Failed to fetch standards:", error);
    return [];
  }
}

export async function importStandardsAction(data: any[]) {
  try {
    // Group rows by Standard Name
    const groupedData = data.reduce((acc: any, row: any) => {
      const name = String(row['標準名稱'] || row.name || '').trim();
      if (!name) return acc;
      
      if (!acc[name]) {
        acc[name] = {
          name,
          targetCategory: String(row['綁定儀器類別'] || row.targetCategory || '').trim() || undefined,
          type: String(row['判定類型'] || row.type || 'STEPPED').trim(),
          defaultCycle: parseInt(row['預設週期(月)'] || row.defaultCycle || '12'),
          defaultPrecision: String(row['預設精度'] || row.defaultPrecision || '').trim(),
          points: [],
          criteria: []
        };
      }
      
      // Add Points if available
      const pointCategory = String(row['點位類別'] || row.pointCategory || '').trim() || "外徑";
      const pointsStr = String(row['校正點位'] || row.points || '').trim();
      const pointUnit = String(row['點位單位'] || row['單位'] || row.unit || '').trim() || "mm";
      
      if (pointsStr) {
        // Check if this category already exists in points
        if (!acc[name].points.find((p: any) => p.category === pointCategory)) {
          acc[name].points.push({
            category: pointCategory,
            points: pointsStr,
            unit: pointUnit
          });
        }
      }
      
      // Add Criterion if available
      const tPlusStr = row['正公差(+)'] || row.tolerancePlus;
      const tMinusStr = row['負公差(-)'] || row.toleranceMinus;
      
      if (tPlusStr !== undefined && tMinusStr !== undefined) {
        acc[name].criteria.push({
          category: pointCategory,
          rangeStart: parseFloat(row['範圍起點'] || row.rangeStart || '0'),
          rangeEnd: parseFloat(row['範圍終點'] || row.rangeEnd || '100'),
          tolerancePlus: parseFloat(tPlusStr),
          toleranceMinus: parseFloat(tMinusStr),
          unit: pointUnit
        });
      }
      
      return acc;
    }, {});

    const { prisma } = await import('@/lib/prisma');
    let imported = 0;
    let updated = 0;

    for (const name of Object.keys(groupedData)) {
      const standardData = groupedData[name];
      
      // Provide defaults if missing
      if (standardData.criteria.length === 0) {
         standardData.criteria.push({ category: "外徑", rangeStart: 0, rangeEnd: 100, tolerancePlus: 0.01, toleranceMinus: -0.01, unit: "mm" });
      }
      if (standardData.points.length === 0) {
         standardData.points.push({ category: "外徑", points: "0, 25, 50, 75, 100", unit: "mm" });
      }

      // Check if standard exists
      const existing = await prisma.acceptanceStandard.findFirst({
        where: { name: standardData.name, deletedAt: null }
      });

      if (existing) {
        // Update (replace criteria and points)
        await StandardService.updateAcceptanceStandard(existing.id, standardData);
        updated++;
      } else {
        // Create new
        await StandardService.createAcceptanceStandard(standardData);
        imported++;
      }
    }

    revalidatePath('/settings');
    revalidatePath('/settings/standards');
    revalidatePath('/data-management');
    return { success: true, imported, updated };
  } catch (error: any) {
    console.error("Import standards error:", error);
    return { success: false, error: error.message || 'Import failed' };
  }
}
