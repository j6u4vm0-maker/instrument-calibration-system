const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const stds = await prisma.acceptanceStandard.findMany({
    include: { criteria: true }
  });
  console.log(JSON.stringify(stds, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
