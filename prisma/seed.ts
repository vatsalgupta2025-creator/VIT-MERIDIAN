import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const BRANCHES = ['BCE', 'BAI', 'BRS', 'BMH', 'BME', 'BEC', 'BMC'];
const YEARS = ['23', '24', '25'];
const HOSTEL_BLOCKS = ['A', 'B', 'C', 'D', 'E', 'F'];
const MALE_BLOCKS = ['A', 'D', 'E', 'F'];
const FEMALE_BLOCKS = ['B', 'C'];
const FIRST_NAMES = [
  'Aarav', 'Aditi', 'Advait', 'Ananya', 'Arjun', 'Arya', 'Dhruv', 'Diya',
  'Ishaan', 'Kavya', 'Krishna', 'Meera', 'Neha', 'Pranav', 'Rhea', 'Rohan',
  'Saanvi', 'Samarth', 'Shreya', 'Siddharth', 'Tara', 'Vedant', 'Vidya', 'Yash'
];
const LAST_NAMES = [
  'Sharma', 'Verma', 'Gupta', 'Patel', 'Singh', 'Kumar', 'Reddy', 'Nair',
  'Iyer', 'Menon', 'Das', 'Sen', 'Bose', 'Chowdhury', 'Roy', 'Joshi',
  'Deshmukh', 'Kulkarni', 'Jain', 'Agarwal', 'Shah', 'Nath', 'Malhotra'
];
const COURSES = [
  { code: 'BACSE201', name: 'Data Structures and Algorithms' },
  { code: 'BACSE301', name: 'Database Management Systems' },
  { code: 'BACSE303', name: 'Operating Systems' },
  { code: 'BAMGT201', name: 'Principles of Management' },
  { code: 'BAEEE203', name: 'Basic Electrical Engineering' },
  { code: 'BACSE401', name: 'Machine Learning' }
];
const CHENNAI_LOCATIONS = [
  'Tambaram', 'Adyar', 'Velachery', 'T. Nagar', 'Anna Nagar', 'Koyambedu', 'Guindy', 'ECR', 'OMR'
];

function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateRegNo(year: string, branch: string, index: number) {
  const isFirstBatch = Math.random() > 0.5;
  const base = isFirstBatch ? 1000 : 5000;
  return `${year}${branch}${base + index}`;
}

async function main() {
  console.log('Clearing existing data...');
  // Be careful: this deletes everything
  await prisma.pollVote.deleteMany();
  await prisma.poll.deleteMany();
  await prisma.travelRequest.deleteMany();
  await prisma.travelPost.deleteMany();
  await prisma.hostelComplaint.deleteMany();
  await prisma.studyBuddyMatch.deleteMany();
  await prisma.studyBuddyProfile.deleteMany();
  await prisma.attendanceRecord.deleteMany();
  await prisma.timetableSlot.deleteMany();
  await prisma.budgetEntry.deleteMany();
  await prisma.lostFoundItem.deleteMany();
  await prisma.appNotification.deleteMany();
  await prisma.parentStudentLink.deleteMany();
  await prisma.user.deleteMany();

  console.log('Generating 800 mock students for VIT Chennai...');
  const passwordHash = await bcrypt.hash('password123', 10);
  
  const usersToCreate = [];
  const parentToCreate = [];

  for (let i = 0; i < 800; i++) {
    const gender = Math.random() > 0.4 ? 'MALE' : 'FEMALE';
    const firstName = getRandomItem(FIRST_NAMES);
    const lastName = getRandomItem(LAST_NAMES);
    const name = `${firstName} ${lastName}`;
    
    const year = getRandomItem(YEARS);
    const branch = getRandomItem(BRANCHES);
    const regNo = generateRegNo(year, branch, i);
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${year}${i}@vitstudent.ac.in`;

    const semester = (26 - parseInt(year)) * 2 - getRandomInt(0, 1);
    
    let block;
    if (year === '25') { // Freshers
      block = 'F';
    } else {
      block = getRandomItem(gender === 'MALE' ? MALE_BLOCKS : FEMALE_BLOCKS);
    }
    const roomNumber = `${getRandomInt(1, 6)}${getRandomInt(10, 99).toString().padStart(2, '0')}`;

    usersToCreate.push({
      email,
      passwordHash,
      role: 'STUDENT',
      name,
      studentId: regNo,
      phone: `+919${getRandomInt(100000000, 999999999)}`,
      department: branch,
      year: semester, // Convert from string to integer
      createdAt: new Date(new Date().getTime() - Math.random() * 10000000000)
    });

    if (i < 50) { // Create 50 parents
      parentToCreate.push({
        email: `parent.of.${firstName.toLowerCase()}${i}@gmail.com`,
        passwordHash,
        role: 'PARENT',
        name: `Mr/Mrs ${lastName}`,
        phone: `+918${getRandomInt(100000000, 999999999)}`,
      });
    }
  }

  // Create Users in batches
  console.log('Inserting students...');
  const createdStudents = [];
  for (let i = 0; i < usersToCreate.length; i += 100) {
    const batch = usersToCreate.slice(i, i + 100);
    // @ts-ignore
    await prisma.user.createMany({ data: batch });
    
    // Fetch them back to get IDs
    const emails = batch.map(u => u.email);
    const created = await prisma.user.findMany({ where: { email: { in: emails } } });
    console.log(`Batch ${i/100 + 1}: fetched ${created.length} users, first id: ${created[0]?.id}`);
    createdStudents.push(...created);
  }

  console.log(`Total students created: ${createdStudents.length}`);
  if (createdStudents.length > 0) {
    console.log(`Sample student id: ${createdStudents[0].id}`);
  }

  console.log('Inserting parents...');
  // @ts-ignore
  await prisma.user.createMany({ data: parentToCreate });
  const parentEmails = parentToCreate.map(p => p.email);
  const createdParents = await prisma.user.findMany({ where: { email: { in: parentEmails } } });

  console.log('Generating Subsystem Data (Polls, Budgets, Travel, Attendance)...');

  // Seed data for a subset of students to avoid massive DB bloat
  // Shuffle and take 200 unique students to avoid uniqueness constraints on one-to-one relations
  const shuffledStudents = [...createdStudents].sort(() => 0.5 - Math.random());
  const selectedStudents = shuffledStudents.slice(0, 200);

  for (const student of selectedStudents) {

    // 1. Timetable & Attendance
    for (const course of COURSES) {
      if (Math.random() > 0.5) {
        // Add timetable slot
        await prisma.timetableSlot.create({
          data: {
            userId: student.id,
            subject: course.name,
            code: course.code,
            faculty: `Prof. ${getRandomItem(LAST_NAMES)}`,
            room: `AB${getRandomInt(1,3)}-${getRandomInt(100,500)}`,
            day: getRandomItem(['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY']),
            startTime: `${getRandomInt(8, 16)}:00`,
            endTime: `${getRandomInt(9, 17)}:00`,
            type: 'LECTURE'
          }
        });

        // Add 10-15 attendance records
        for (let a = 0; a < getRandomInt(10, 15); a++) {
          await prisma.attendanceRecord.create({
            data: {
              userId: student.id,
              subject: course.name,
              date: new Date(new Date().getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000),
              status: Math.random() > 0.2 ? 'PRESENT' : 'ABSENT',
              notes: 'Regular Class'
            }
          });
        }
      }
    }

    // 2. Budget
    for (let b = 0; b < getRandomInt(3, 10); b++) {
      const isIncome = Math.random() > 0.8;
      await prisma.budgetEntry.create({
        data: {
          userId: student.id,
          title: isIncome ? 'Allowance' : getRandomItem(['Food', 'Books', 'Travel', 'Entertainment']),
          amount: isIncome ? getRandomInt(2000, 5000) : getRandomInt(100, 500),
          type: isIncome ? 'INCOME' : 'EXPENSE',
          category: isIncome ? 'OTHER' : getRandomItem(['FOOD', 'TRANSPORT', 'ACADEMIC', 'ENTERTAINMENT', 'OTHER']),
          date: new Date(new Date().getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000)
        }
      });
    }

    // 3. Hostel Complaints
    if (Math.random() > 0.7) {
      await prisma.hostelComplaint.create({
        data: {
          userId: student.id,
          hostelBlock: student.year === '25' ? 'F' : getRandomItem(['A', 'B', 'C', 'D', 'E']), // rough guess
          roomNumber: `${getRandomInt(1, 6)}${getRandomInt(10, 99).toString().padStart(2, '0')}`,
          title: getRandomItem(['Fan not working', 'AC cooling issue', 'Water leakage', 'Wifi very slow']),
          description: 'Need maintenance ASAP',
          category: getRandomItem(['ELECTRICAL', 'PLUMBING', 'CLEANING', 'WIFI', 'OTHER']),
          status: getRandomItem(['OPEN', 'IN_PROGRESS', 'RESOLVED']),
          priority: getRandomItem(['LOW', 'MEDIUM', 'HIGH'])
        }
      });
    }

    // 4. Travel Pool
    if (Math.random() > 0.8) {
      await prisma.travelPost.create({
        data: {
          userId: student.id,
          from: Math.random() > 0.5 ? 'VIT Chennai' : getRandomItem(CHENNAI_LOCATIONS),
          to: Math.random() > 0.5 ? getRandomItem(CHENNAI_LOCATIONS) : 'VIT Chennai',
          departureTime: new Date(new Date().getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000),
          availableSeats: getRandomInt(1, 3),
          mode: getRandomItem(['CAB', 'AUTO', 'BIKE']),
          fare: getRandomInt(100, 500)
        }
      });
    }

    // 5. Study Buddy Profile
    if (Math.random() > 0.6) {
      await prisma.studyBuddyProfile.create({
        data: {
          userId: student.id,
          subjects: JSON.stringify([getRandomItem(COURSES).name, getRandomItem(COURSES).name]),
          studyStyle: getRandomItem(['POMODORO', 'GROUP', 'LATE_NIGHT', 'EARLY_BIRD']),
          goals: 'Prepare for CAT-1',
          bio: 'Looking for a focused study partner.'
        }
      });
    }
  }

  console.log('Seeding Complete! Created ~800 students and rich subsystem data.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
