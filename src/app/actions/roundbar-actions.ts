"use server";

import { RoundBarService } from "@/services/round-bar-service";
import { revalidatePath } from "next/cache";

export async function createRoundBarAction(data: any) {
  try {
    const result = await RoundBarService.createRoundBar(data);
    revalidatePath("/round-bar");
    revalidatePath("/");
    return { success: true, data: result };
  } catch (error: any) {
    console.error("Failed to create round bar:", error);
    if (error.code === 'P2002') {
      return { success: false, error: "這個儀器設備編號已經存在，請更換一個編號。" };
    }
    return { success: false, error: error.message || "建立圓棒失敗" };
  }
}

export async function updateRoundBarAction(id: string, data: any) {
  try {
    const result = await RoundBarService.updateRoundBar(id, data);
    revalidatePath("/round-bar");
    revalidatePath(`/round-bar/${id}`);
    return { success: true, data: result };
  } catch (error: any) {
    console.error("Failed to update round bar:", error);
    return { success: false, error: error.message || "更新圓棒失敗" };
  }
}

export async function deleteRoundBarAction(id: string) {
  try {
    await RoundBarService.deleteRoundBar(id);
    revalidatePath("/round-bar");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete round bar:", error);
    return { success: false, error: error.message || "刪除圓棒失敗" };
  }
}

export async function importRoundBarsAction(data: any[]) {
  const result = await RoundBarService.bulkImportRoundBars(data);
  revalidatePath("/round-bar");
  revalidatePath("/");
  return result;
}

