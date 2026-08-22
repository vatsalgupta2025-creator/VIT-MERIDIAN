const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const filePath = path.join(__dirname, 'src', 'components', 'data.xlsx');
  const data = fs.readFileSync(filePath, 'utf8');
  const lines = data.split('\n').filter(line => line.trim() !== '');
  
  // Skip header
  const records = lines.slice(1);
  const defaultPasswordHash = await bcrypt.hash('password123', 10);
  
  let count = 0;
  
  for (const line of records) {
    const cols = line.split('\t');
    // Columns: Batch No [0], RegNo [1], Name [2], Mail [3], Mobile [4]
    const studentId = cols[1]?.trim();
    const name = cols[2]?.trim();
    const email = cols[3]?.trim();
    const phone = cols[4]?.trim();
    
    if (studentId && name && email) {
      // Determine department/branch from RegNo if possible, e.g. 25BRS = B.Tech Data Science?
      let department = 'Computer Science'; // default
      if (studentId.includes('BRS')) department = 'Computer Science';
      if (studentId.includes('BEC')) department = 'Electronics';
      if (studentId.includes('BMH')) department = 'Mechanical';
      
      try {
        await prisma.user.upsert({
          where: { email },
          update: {
            name,
            studentId,
            phone: phone || null,
            year: 2025,
            department
          },
          create: {
            email,
            name,
            studentId,
            phone: phone || null,
            year: 2025,
            department,
            role: 'STUDENT',
            passwordHash: defaultPasswordHash
          }
        });
        count++;
      } catch (err) {
        console.error(`Failed to insert ${studentId}:`, err.message);
      }
    }
  }
  
  console.log(`Successfully imported ${count} students into Prisma.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
