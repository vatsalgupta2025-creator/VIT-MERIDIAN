const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.attendanceRecord.deleteMany();
  await prisma.timetableSlot.deleteMany();
  await prisma.budgetEntry.deleteMany();
  await prisma.hostelComplaint.deleteMany();
  await prisma.travelPost.deleteMany();
  await prisma.travelRequest.deleteMany();
  await prisma.studyBuddyMatch.deleteMany();
  await prisma.studyBuddyProfile.deleteMany();
  await prisma.poll.deleteMany();
  await prisma.pollVote.deleteMany();
  await prisma.lostFoundItem.deleteMany();
  await prisma.appNotification.deleteMany();
  await prisma.parentStudentLink.deleteMany();
  await prisma.emergencyContact.deleteMany();
  await prisma.emergencyEvent.deleteMany();
  await prisma.safeWalkSession.deleteMany();
  await prisma.safetyNotification.deleteMany();
  await prisma.safetyReport.deleteMany();
  await prisma.user.deleteMany();
  console.log('Database cleared');
  await prisma.$disconnect();
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
