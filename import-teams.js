const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const filePath = path.join(__dirname, 'src', 'components', 'data.xlsx');
  const data = fs.readFileSync(filePath, 'utf8');
  const lines = data.split('\n').filter(line => line.trim() !== '');
  
  // Find where the team data starts
  const teamDataHeaderIndex = lines.findIndex(line => line.includes('Team member 1 - Register Number'));
  if (teamDataHeaderIndex === -1) {
    console.error('Could not find team data section in data.xlsx');
    return;
  }
  
  const teamLines = lines.slice(teamDataHeaderIndex + 1);
  const studentsToUpdate = [];
  const seedUpdates = {};
  
  for (const line of teamLines) {
    const cols = line.split('\t');
    if (cols.length >= 8) {
      const reg1 = cols[0]?.trim();
      const reg2 = cols[2]?.trim();
      const reg3 = cols[4]?.trim();
      const guideId = cols[6]?.trim();
      const guideName = cols[7]?.trim();
      
      const teamMembers = [reg1, reg2, reg3].filter(Boolean);
      
      if (guideId && guideName) {
        teamMembers.forEach(reg => {
          studentsToUpdate.push({ reg, guideId, guideName });
          seedUpdates[reg] = { guideId, guideName, teamMembers };
        });
      }
    }
  }
  
  console.log(`Found ${teamLines.length} teams, updating ${studentsToUpdate.length} students...`);
  
  // Update Prisma Database
  let updatedInPrisma = 0;
  for (const stu of studentsToUpdate) {
    try {
      await prisma.user.updateMany({
        where: { studentId: stu.reg },
        data: {
          guideId: stu.guideId,
          guideName: stu.guideName
        }
      });
      updatedInPrisma++;
    } catch (err) {
      console.error(`Failed to update ${stu.reg} in Prisma:`, err.message);
    }
  }
  
  console.log(`Updated ${updatedInPrisma} students in Prisma DB.`);
  
  // Now update the seed file so the frontend picks it up automatically
  const seedPath = path.join(__dirname, 'src', 'data', 'seed', 'students.ts');
  let seedContent = fs.readFileSync(seedPath, 'utf8');
  
  const toAppend = '\n// ── 2025 Batch Team Updates ──\n' + Object.keys(seedUpdates).map(reg => {
    const info = seedUpdates[reg];
    return `if (seedStudents["${reg}"]) { seedStudents["${reg}"].projectInfo = ${JSON.stringify(info)}; }`;
  }).join('\n');
  
  fs.writeFileSync(seedPath, seedContent + toAppend);
  console.log('Appended team updates to seedStudents in students.ts');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
