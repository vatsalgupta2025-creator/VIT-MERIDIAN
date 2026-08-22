const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const batch = [];
  for (let i = 0; i < 100; i++) {
    batch.push({
      email: `test${i}@test.com`,
      name: `Test ${i}`,
      passwordHash: 'hash',
      role: 'STUDENT'
    });
  }
  
  await prisma.user.createMany({ data: batch });
  
  const users = await prisma.user.findMany({ where: { email: { in: batch.map(b => b.email) } } });
  console.log('Created users count:', users.length);
  
  const firstUser = users[0];
  console.log('First user id:', firstUser.id);
  
  await prisma.attendanceRecord.create({
    data: { userId: firstUser.id, subject: 'Test', date: new Date(), status: 'PRESENT' }
  });
  console.log('Created attendance record');
  
  await prisma.$disconnect();
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
