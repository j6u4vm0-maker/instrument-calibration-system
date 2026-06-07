import "dotenv/config";
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as iconv from 'iconv-lite';
import { parse } from 'csv-parse/sync';
import { parse as parseDate, isValid } from 'date-fns';

const prisma = new PrismaClient();

function parseCycle(cycleStr: string): number {
  if (cycleStr.includes('年')) return 12;
  if (cycleStr.includes('半年')) return 6;
  return 12; // default 12 months
}

function parseDateStr(dateStr: string): Date {
  const parsed = parseDate(dateStr, 'yyyy/MM/dd', new Date());
  return isValid(parsed) ? parsed : new Date();
}

async function main() {
  console.log('Seeding data from CSV...');
  
  const fileBuffer = fs.readFileSync('印度廠設備清單_2025.10.22.csv');
  const content = iconv.decode(fileBuffer, 'big5');
  
  const records: any[] = parse(content, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });

  for (const record of records) {
    const id = record['儀器設備編號'];
    if (!id) continue;

    const name = record['儀器設備名稱'] || '未命名設備';
    const spec = record['廠牌'] || null;
    const category = record['儀器類別'] || '其他';
    const department = (record['部門'] || record['部門 '] || '印度廠').trim();
    const calibrationCycle = parseCycle(record['校驗週期'] || '');
    
    // Mapping new fields
    const precision = record['精度'] || null;
    const usageRange = record['使用範圍'] || null;
    const calPoints = record['校正點'] || null;
    const acceptance = record['允收標準'] || null;
    const tafLogo = record['TAF Logo'] || null;
    const manager = record['管理者'] || null;
    const calType = record['校驗類別'] || null;
    const notes = record['備  註'] || null;
    const capacity = record['設備能力範圍'] || null;
    const nextCalMonth = record['下次校正月'] || null;
    const extReport = record['外校報告'] || null;
    const calDate2025 = record['2025年校正日'] || null;
    const calVendor2025 = record['2025年校正商'] || null;

    let entryDate = null;
    if (record['入廠日期'] && record['入廠日期'] !== '-') {
      entryDate = parseDateStr(record['入廠日期']);
    }

    let lastCalDate = new Date();
    if (record['實際校正日期'] && record['實際校正日期'] !== '-') {
      lastCalDate = parseDateStr(record['實際校正日期']);
    }
    
    let actualCalDate = null;
    if (record['實際校正日期'] && record['實際校正日期'] !== '-') {
      actualCalDate = parseDateStr(record['實際校正日期']);
    }

    let nextCalDate = new Date();
    if (record['下次校正日期'] && record['下次校正日期'] !== '-') {
      nextCalDate = parseDateStr(record['下次校正日期']);
    }

    try {
      await prisma.gage.upsert({
        where: { id },
        update: {
          name,
          spec,
          category,
          precision,
          usageRange,
          calPoints,
          acceptance,
          tafLogo,
          entryDate,
          manager,
          calType,
          calibrationCycle,
          notes,
          capacity,
          lastCalDate,
          actualCalDate,
          nextCalDate,
          nextCalMonth,
          extReport,
          calDate2025,
          calVendor2025,
          location: 'India',
          department,
        },
        create: {
          id,
          name,
          spec,
          category,
          precision,
          usageRange,
          calPoints,
          acceptance,
          tafLogo,
          entryDate,
          manager,
          calType,
          calibrationCycle,
          notes,
          capacity,
          lastCalDate,
          actualCalDate,
          nextCalDate,
          nextCalMonth,
          extReport,
          calDate2025,
          calVendor2025,
          location: 'India',
          department,
          status: 'IN_USE',
        },
      });
      console.log(`Upserted Gage: ${id}`);
    } catch (e) {
      console.error(`Failed to upsert ${id}:`, e);
    }
  }
  
  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
