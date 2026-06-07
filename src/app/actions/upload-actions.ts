"use server";

import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export async function uploadReportAction(formData: FormData) {
  const file = formData.get("file") as File;
  if (!file || file.size === 0) return null;

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // 確保目錄存在
  const uploadDir = join(process.cwd(), "public", "uploads", "reports");
  if (!existsSync(uploadDir)) {
    await mkdir(uploadDir, { recursive: true });
  }

  // 建立檔名 (時間戳 + 原檔名)
  const filename = `${Date.now()}-${file.name}`;
  const path = join(uploadDir, filename);
  
  await writeFile(path, buffer);
  
  // 回傳 URL
  return `/uploads/reports/${filename}`;
}
