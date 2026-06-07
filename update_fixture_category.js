const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const result = await prisma.fixture.updateMany({
    where: { deletedAt: null },
    data: { category: '檢具' }
  });
  console.log('Updated fixtures:', result.count);
  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
