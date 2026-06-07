const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.calibrationRecord.update({
    where: { id: 'cmonnafos000ar275edc0m1v5' },
    data: { status: 'PENDING' }
  });
  console.log('Fixed status to PENDING');
}

main().catch(console.error).finally(() => prisma.$disconnect());
