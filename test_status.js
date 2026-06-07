const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { isAfter, differenceInDays } = require('date-fns');

function evaluateStatus(nextCalDate, calType) {
  if (calType === '免校正') return 'NO_CAL';
  const now = new Date();
  const daysDiff = differenceInDays(nextCalDate, now);
  if (isAfter(now, nextCalDate)) return 'OVERDUE';
  if (daysDiff <= 30) return 'WARNING';
  return 'PASS';
}

async function main() {
  const gages = await prisma.gage.findMany();
  for (const gage of gages) {
    if (gage.id === 'VC-SAMPLE-001') {
      console.log('VC-SAMPLE-001 computed status:', evaluateStatus(gage.nextCalDate, gage.calType));
    }
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
