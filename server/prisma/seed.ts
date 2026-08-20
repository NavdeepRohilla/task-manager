import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const SALT_ROUNDS = 12;

async function main() {
  const adminPassword = await bcrypt.hash('Admin@12345', SALT_ROUNDS);
  const userPassword = await bcrypt.hash('User@12345', SALT_ROUNDS);

  await prisma.user.upsert({
    where: { email: '[email protected]' },
    update: {},
    create: {
      name: 'Admin',
      email: '[email protected]',
      password: adminPassword,
      role: Role.ADMIN,
    },
  });

  await prisma.user.upsert({
    where: { email: '[email protected]' },
    update: {},
    create: {
      name: 'Demo User',
      email: '[email protected]',
      password: userPassword,
      role: Role.USER,
    },
  });

  console.log('Seed complete:');
  console.log('  [email protected] / Admin@12345  (role: ADMIN)');
  console.log('  [email protected] / User@12345   (role: USER)');
  console.log('These are LOCAL DEV credentials only. Never seed these into a real production database.');
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
