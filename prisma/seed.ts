import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding VITGROWW SAFE database...');

  // Clean existing data
  await prisma.safetyNotification.deleteMany();
  await prisma.safeWalkSession.deleteMany();
  await prisma.emergencyEvent.deleteMany();
  await prisma.safetyReport.deleteMany();
  await prisma.safetyAlert.deleteMany();
  await prisma.emergencyContact.deleteMany();
  await prisma.safetyLocation.deleteMany();
  await prisma.user.deleteMany();

  // --- Users ---
  const studentHash = await bcrypt.hash('student123', 10);
  const adminHash = await bcrypt.hash('admin123', 10);

  const student = await prisma.user.create({
    data: {
      email: 'ayush@vitgroww.edu',
      name: 'Ayush Upadhyay',
      studentId: 'STU-2023-0847',
      role: 'STUDENT',
      passwordHash: studentHash,
    },
  });

  const admin = await prisma.user.create({
    data: {
      email: 'admin@vitgroww.edu',
      name: 'Safety Admin',
      studentId: null,
      role: 'ADMIN',
      passwordHash: adminHash,
    },
  });

  console.log('✅ Users created');

  // --- Emergency Contacts ---
  await prisma.emergencyContact.createMany({
    data: [
      { userId: student.id, name: 'Ravi Upadhyay', phone: '+91-98765-43210', relationship: 'Father' },
      { userId: student.id, name: 'Meena Upadhyay', phone: '+91-87654-32109', relationship: 'Mother' },
    ],
  });

  console.log('✅ Emergency contacts created');

  // --- Campus Safety Locations ---
  await prisma.safetyLocation.createMany({
    data: [
      { name: 'Main Security Post', type: 'SECURITY_POST', latitude: 12.9698, longitude: 79.1559, description: '24/7 security desk at Main Gate', phone: '+91-416-220-2000' },
      { name: 'VIT Medical Centre', type: 'MEDICAL', latitude: 12.9712, longitude: 79.1572, description: 'On-campus medical facility with ambulance', phone: '+91-416-220-2020' },
      { name: 'Men\'s Hostel Block A', type: 'HOSTEL', latitude: 12.9685, longitude: 79.1548, description: 'Hostel warden available 24/7' },
      { name: 'Women\'s Hostel Block C', type: 'HOSTEL', latitude: 12.9720, longitude: 79.1565, description: 'Women\'s hostel — warden on duty 24/7' },
      { name: 'Tech Tower Security', type: 'SECURITY_POST', latitude: 12.9705, longitude: 79.1580, description: 'Security post near academic blocks' },
      { name: 'Emergency Phone — Library', type: 'EMERGENCY_PHONE', latitude: 12.9710, longitude: 79.1570, description: 'Emergency direct-dial phone' },
      { name: 'Emergency Phone — Cafeteria', type: 'EMERGENCY_PHONE', latitude: 12.9700, longitude: 79.1555, description: 'Emergency direct-dial phone near cafeteria' },
      { name: 'Main Gate', type: 'MAIN_GATE', latitude: 12.9690, longitude: 79.1540, description: 'Main campus entrance — guards on duty', phone: '+91-416-220-2001' },
      { name: 'Academic Block A', type: 'ACADEMIC', latitude: 12.9703, longitude: 79.1575, description: 'Computer Science & Engineering blocks' },
      { name: 'Sports Complex', type: 'ACADEMIC', latitude: 12.9725, longitude: 79.1560, description: 'Sports facility — first aid available' },
    ],
  });

  console.log('✅ Campus safety locations created');

  // --- Safety Alerts ---
  await prisma.safetyAlert.createMany({
    data: [
      {
        title: 'Heavy Rain Advisory',
        description: 'Heavy rainfall expected tonight. Avoid low-lying areas near the north boundary. Umbrella corridors near TT square are open.',
        severity: 'MEDIUM',
        location: 'North Campus',
        active: true,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        createdBy: admin.id,
      },
      {
        title: 'Suspicious Activity Reported',
        description: 'Unidentified person reported near Hostel Block G. Security patrolling the area. Report anything suspicious to the security post immediately.',
        severity: 'HIGH',
        location: 'Hostel Block G area',
        active: true,
        expiresAt: new Date(Date.now() + 6 * 60 * 60 * 1000),
        createdBy: admin.id,
      },
      {
        title: 'Campus Power Outage — Resolved',
        description: 'Power has been restored to all academic blocks. Elevator service resuming.',
        severity: 'LOW',
        location: 'Academic Blocks',
        active: false,
        createdBy: admin.id,
      },
    ],
  });

  console.log('✅ Safety alerts created');

  // --- Sample Safety Reports ---
  const now = new Date();
  await prisma.safetyReport.createMany({
    data: [
      {
        reportId: 'VS-1001',
        userId: student.id,
        category: 'INFRASTRUCTURE_HAZARD',
        description: 'Broken staircase railing on 2nd floor of AB Block. Poses fall risk.',
        location: 'Academic Block A, 2nd Floor',
        incidentAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
        status: 'RESOLVED',
        adminNotes: 'Maintenance team repaired on Aug 20.',
      },
      {
        reportId: 'VS-1002',
        userId: student.id,
        category: 'SUSPICIOUS_ACTIVITY',
        description: 'Unattended bag left near library entrance for 2+ hours.',
        location: 'Central Library, Main Entrance',
        incidentAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
        status: 'UNDER_REVIEW',
      },
    ],
  });

  console.log('✅ Sample reports created');

  // --- Notifications ---
  await prisma.safetyNotification.createMany({
    data: [
      { userId: student.id, title: 'Report #VS-1001 Resolved', body: 'Your incident report #VS-1001 has been reviewed and resolved by the safety team.', read: true },
      { userId: student.id, title: 'Campus Safety Alert', body: 'Heavy rain advisory issued for north campus. Stay safe!', read: false },
    ],
  });

  console.log('✅ Notifications created');
  console.log('\n🎉 Seeding complete!');
  console.log('📧 Student login: ayush@vitgroww.edu / student123');
  console.log('🔑 Admin login:   admin@vitgroww.edu / admin123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
