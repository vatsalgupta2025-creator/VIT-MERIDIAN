const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const emails = [];
  for (let i = 0; i < 100; i++) {
    emails.push(`findmany${i}@test.com`);
  }
  
  await prisma.user.createMany({ data: emails.map(e => ({ email: e, name: 'Test', passwordHash: 'h', role: 'STUDENT' })) });
  
  const users = await prisma.user.findMany({ where: { email: { in: emails } } });
  console.log('Found users after createMany:', users.length);
  
  await prisma.$disconnect();
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
