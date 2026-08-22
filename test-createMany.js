const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.user.createMany({
    data: [
      { email: 'a@test.com', name: 'A', passwordHash: 'h', role: 'STUDENT' },
      { email: 'b@test.com', name: 'B', passwordHash: 'h', role: 'STUDENT' },
    ]
  });
  
  const users = await prisma.user.findMany({ where: { email: { in: ['a@test.com', 'b@test.com'] } } });
  console.log('Found users:', users.map(u => ({ id: u.id, email: u.email })));
  
  for (const u of users) {
    await prisma.attendanceRecord.create({
      data: { userId: u.id, subject: 'Test', date: new Date(), status: 'PRESENT' }
    });
  }
  console.log('Created attendance records');
  
  await prisma.$disconnect();
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
