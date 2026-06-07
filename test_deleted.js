const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const gages = await prisma.gage.findMany();
  for (const gage of gages) {
    if (gage.id === 'VC-SAMPLE-001') {
      console.log('VC-SAMPLE-001 deletedAt:', gage.deletedAt);
    }
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
