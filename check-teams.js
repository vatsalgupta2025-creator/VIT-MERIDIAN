const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const u = await prisma.user.findMany({ 
    where: { 
      studentId: { in: ['25BCE5131', '25BCE5503', '25BCE5324'] } 
    } 
  }); 
  console.log(`Found ${u.length} students`); 
}

main().finally(() => prisma.$disconnect());
