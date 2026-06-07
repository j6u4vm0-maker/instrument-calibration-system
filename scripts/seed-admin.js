const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const adminAccount = 'admin';
  const adminPassword = 'admin123';

  // Check if admin exists
  const existingAdmin = await prisma.user.findUnique({
    where: { account: adminAccount }
  });

  if (existingAdmin) {
    console.log('Admin user already exists.');
    return;
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(adminPassword, salt);

  await prisma.user.create({
    data: {
      account: adminAccount,
      passwordHash: passwordHash,
      role: 'ADMIN',
      name: '系統管理員'
    }
  });

  console.log('Admin user created successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
