const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const attendanceCount = await prisma.attendanceRecord.count();
  console.log('Attendance count:', attendanceCount);
  await prisma.$disconnect();
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
