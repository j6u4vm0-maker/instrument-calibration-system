import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // 取得資料庫檔案路徑
    const dbPath = path.resolve(process.cwd(), 'prisma/dev.db');
    
    if (!fs.existsSync(dbPath)) {
      return NextResponse.json({ error: 'Database file not found' }, { status: 404 });
    }

    // 讀取資料庫檔案
    const fileBuffer = fs.readFileSync(dbPath);
    
    // 產生檔名 (加上日期時間)
    const dateStr = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const fileName = `nexus-calib-backup-${dateStr}.db`;

    // 設定 Headers 讓前端下載
    const response = new NextResponse(fileBuffer);
    response.headers.set('Content-Type', 'application/octet-stream');
    response.headers.set('Content-Disposition', `attachment; filename="${fileName}"`);
    
    return response;
  } catch (error: any) {
    console.error('Backup error:', error);
    return NextResponse.json({ error: 'Failed to create backup' }, { status: 500 });
  }
}
