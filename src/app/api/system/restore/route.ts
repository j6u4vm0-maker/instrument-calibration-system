import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!file.name.endsWith('.db')) {
      return NextResponse.json({ error: 'Invalid file format. Only .db files are accepted.' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    
    // 檢查 SQLite Magic Bytes
    // SQLite format 3 starts with: "SQLite format 3\000"
    const magicString = buffer.toString('utf-8', 0, 16);
    if (magicString !== 'SQLite format 3\x00') {
      return NextResponse.json({ error: 'Invalid SQLite database file.' }, { status: 400 });
    }

    const dbPath = path.resolve(process.cwd(), 'prisma/dev.db');
    
    // 建立一個備份以防萬一
    if (fs.existsSync(dbPath)) {
      const backupPath = path.resolve(process.cwd(), `prisma/dev.db.bak.${Date.now()}`);
      fs.copyFileSync(dbPath, backupPath);
    }

    // 覆蓋目前的資料庫檔案
    fs.writeFileSync(dbPath, buffer);

    return NextResponse.json({ success: true, message: 'Database restored successfully' });
  } catch (error: any) {
    console.error('Restore error:', error);
    return NextResponse.json({ error: error.message || 'Failed to restore database' }, { status: 500 });
  }
}
