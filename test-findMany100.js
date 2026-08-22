const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const emails = [];
  for (let i = 0; i < 100; i++) {
    emails.push(`findmany${i}@test.com`);
  }
  
  const users = await prisma.user.findMany({ where: { email: { in: emails } } });
  console.log('Found users with 100-value IN clause:', users.length);
  
  await prisma.$disconnect();
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
