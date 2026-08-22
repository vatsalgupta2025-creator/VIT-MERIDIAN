const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({ take: 5 });
  console.log('Sample users:', users.map(u => ({ id: u.id, email: u.email })));
  
  const attendanceCount = await prisma.attendanceRecord.count();
  console.log('Attendance count:', attendanceCount);
  
  if (users.length > 0) {
    try {
      const record = await prisma.attendanceRecord.create({
        data: { userId: users[0].id, subject: 'Test', date: new Date(), status: 'PRESENT' }
      });
      console.log('Created attendance record:', record.id);
    } catch (e) {
      console.error('Failed to create attendance record:', e.message);
    }
  }
  
  await prisma.$disconnect();
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
