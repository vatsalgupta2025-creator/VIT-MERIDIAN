const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.create({
    data: { email: 'test@test.com', name: 'Test', passwordHash: 'hash', role: 'STUDENT' }
  });
  console.log('Created user:', user.id);
  
  const record = await prisma.attendanceRecord.create({
    data: {
      userId: user.id,
      subject: 'Test',
      date: new Date(),
      status: 'PRESENT'
    }
  });
  console.log('Created record:', record.id);
  
  await prisma.$disconnect();
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
