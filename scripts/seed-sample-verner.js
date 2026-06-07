const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Creating sample Vernier Caliper standard...');

  // 1. 建立標準庫
  const standard = await prisma.acceptanceStandard.create({
    data: {
      name: "游標卡尺-通用判定標準",
      description: "包含外徑(OD)與內徑(ID)的複合判定規則",
      type: "STEPPED",
      criteria: {
        create: [
          // 外徑部分
          { category: "外徑", rangeStart: 0, rangeEnd: 24, tolerancePlus: 0.02, toleranceMinus: -0.02, unit: "mm" },
          { category: "外徑", rangeStart: 25, rangeEnd: 100, tolerancePlus: 0.04, toleranceMinus: -0.04, unit: "mm" },
          { category: "外徑", rangeStart: 101, rangeEnd: 200, tolerancePlus: 0.06, toleranceMinus: -0.06, unit: "mm" },
          // 內徑部分
          { category: "內徑", rangeStart: 0, rangeEnd: 10, tolerancePlus: 0.02, toleranceMinus: -0.02, unit: "mm" },
          { category: "內徑", rangeStart: 10.001, rangeEnd: 1000, tolerancePlus: 0.04, toleranceMinus: -0.04, unit: "mm" },
        ]
      }
    }
  });

  console.log('Standard created:', standard.name);

  // 2. 找出一個現有的儀器或建立一個新的來測試
  const testGageId = "VC-SAMPLE-001";
  await prisma.gage.upsert({
    where: { id: testGageId },
    update: { standardId: standard.id },
    create: {
      id: testGageId,
      name: "範例游標卡尺 (測試用)",
      category: "游標卡尺",
      spec: "0-200mm",
      calibrationCycle: 12,
      lastCalDate: new Date(),
      nextCalDate: new Date(),
      status: "IN_USE",
      location: "Taiwan",
      standardId: standard.id,
      calPoints: "外徑: 0,1,3,5,10,25,50,100,150,200; 內徑: 3,5.5,10,25,50"
    }
  });

  console.log('Sample gage linked to standard: ', testGageId);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
