import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('admin', 10);

  const user = await prisma.user.upsert({
    where: { account: 'admin' },
    update: {
      passwordHash,
      role: 'ADMIN',
      name: '系統管理員',
      isActive: true,
    },
    create: {
      account: 'admin',
      passwordHash,
      role: 'ADMIN',
      name: '系統管理員',
      isActive: true,
    },
  });

  console.log('✅ Admin user created/updated:', user.account, '| role:', user.role);
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
