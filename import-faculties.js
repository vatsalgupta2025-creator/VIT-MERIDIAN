const fs = require('fs');
const path = require('path');

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
  const faculties = {}; // Key: guideId, Value: guideName
  const facultyStudents = {}; // Key: guideId, Value: array of student regs
  
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
        faculties[guideId] = guideName;
        if (!facultyStudents[guideId]) facultyStudents[guideId] = new Set();
        teamMembers.forEach(reg => {
          if (reg) facultyStudents[guideId].add(reg);
        });
      }
    }
  }
  
  const uniqueFaculties = Object.keys(faculties);
  console.log(`Found ${uniqueFaculties.length} unique faculties.`);
  
  // Generate faculties.ts
  const facultiesTsPath = path.join(__dirname, 'src', 'data', 'seed', 'faculties.ts');
  
  let facultiesTsContent = `export const seedFaculties: Record<string, any> = {\n`;
  
  for (const id of uniqueFaculties) {
    const name = faculties[id];
    const students = Array.from(facultyStudents[id]);
    
    facultiesTsContent += `  "${id}": {
    id: "${id}",
    name: "${name}",
    role: "FACULTY",
    department: "SCOPE",
    assignedStudents: ${JSON.stringify(students)}
  },\n`;
  }
  
  facultiesTsContent += `};\n`;
  
  fs.writeFileSync(facultiesTsPath, facultiesTsContent);
  console.log(`Successfully generated src/data/seed/faculties.ts`);
}

main().catch(console.error);
