import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!file.name.endsWith('.db')) {
      return NextResponse.json({ error: 'Invalid file format. Must be a .db file' }, { status: 400 });
    }

    // 將上傳的檔案轉為 Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const dbPath = path.join(process.cwd(), 'prisma', 'dev.db');
    const backupPath = path.join(process.cwd(), 'prisma', `dev_backup_${Date.now()}.db`);

    // 1. 斷開現有的 Prisma 連線
    await prisma.$disconnect();

    // 2. 如果目前的資料庫存在，先備份
    if (fs.existsSync(dbPath)) {
      fs.copyFileSync(dbPath, backupPath);
    }

    // 3. 寫入新的資料庫檔案 (覆蓋)
    fs.writeFileSync(dbPath, buffer);

    return NextResponse.json({ success: true, message: 'Database imported successfully' });
  } catch (error: any) {
    console.error('Import DB error:', error);
    return NextResponse.json({ error: error.message || 'Failed to import database' }, { status: 500 });
  }
}
