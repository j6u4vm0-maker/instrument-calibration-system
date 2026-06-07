const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const gages = await prisma.gage.findMany();
  console.log('Total gages:', gages.length);
  
  for (const gage of gages) {
    if (gage.calType === '免校正') continue;
    
    const now = new Date();
    const nextCalDate = new Date(gage.nextCalDate);
    
    const isOverdue = now > nextCalDate;
    
    if (isOverdue) {
      console.log('OVERDUE Gage:', gage.id, gage.nextCalDate);
    }
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
