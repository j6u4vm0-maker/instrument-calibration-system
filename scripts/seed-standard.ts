import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Vernier Caliper Standard...');

  // 1. Create the standard for Outer Diameter (外徑)
  const odStandard = await prisma.acceptanceStandard.create({
    data: {
      name: '游標卡尺-外徑允收標準',
      description: '通用游標卡尺外徑量測判定標準',
      type: 'STEPPED',
      criteria: {
        create: [
          { rangeStart: 1, rangeEnd: 24, tolerancePlus: 0.02, toleranceMinus: -0.02, unit: 'mm' },
          { rangeStart: 25, rangeEnd: 100, tolerancePlus: 0.04, toleranceMinus: -0.04, unit: 'mm' },
          { rangeStart: 101, rangeEnd: 200, tolerancePlus: 0.06, toleranceMinus: -0.06, unit: 'mm' },
        ]
      }
    }
  });

  // 2. Create the standard for Inner Diameter (內徑)
  const idStandard = await prisma.acceptanceStandard.create({
    data: {
      name: '游標卡尺-內徑允收標準',
      description: '通用游標卡尺內徑量測判定標準',
      type: 'STEPPED',
      criteria: {
        create: [
          { rangeStart: 0, rangeEnd: 10, tolerancePlus: 0.02, toleranceMinus: -0.02, unit: 'mm' },
          { rangeStart: 10.001, rangeEnd: 9999, tolerancePlus: 0.04, toleranceMinus: -0.04, unit: 'mm' },
        ]
      }
    }
  });

  console.log('Seed complete!');
  console.log('OD Standard ID:', odStandard.id);
  console.log('ID Standard ID:', idStandard.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$client.disconnect();
  });
