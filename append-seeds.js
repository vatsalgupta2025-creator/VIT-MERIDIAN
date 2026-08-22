const fs = require('fs');
const path = require('path');

const filePath = path.join('src', 'components', 'data.xlsx');
const data = fs.readFileSync(filePath, 'utf8');
const lines = data.split('\n').filter(line => line.trim() !== '').slice(1);

const studentsMap = {};
for (const line of lines) {
  const cols = line.split('\t');
  const studentId = cols[1]?.trim();
  const name = cols[2]?.trim();
  const email = cols[3]?.trim();
  const phone = cols[4]?.trim();
  
  if (studentId && name) {
    let branch = 'Computer Science';
    if (studentId.includes('BEC')) branch = 'Electronics';
    if (studentId.includes('BMH')) branch = 'Mechanical';
    
    studentsMap[studentId] = {
      id: studentId,
      personalInfo: {
        fullName: name,
        dob: '2005-01-01',
        bloodGroup: 'O+',
        guardianName: 'Guardian',
        guardianContact: phone || '+91-0000000000'
      },
      enrollment: {
        program: 'B.Tech',
        branch: branch,
        batch: '2025-2029',
        currentSemester: 1,
        status: 'ACTIVE'
      },
      academicStanding: {
        cgpa: 0,
        totalCreditsEarned: 0,
        activeArrears: 0,
        disciplinaryFlags: false
      }
    };
  }
}

const targetPath = path.join('src', 'data', 'seed', 'students.ts');
let seedContent = fs.readFileSync(targetPath, 'utf8');

const toAppend = '\n// ── 2025 Batch Imported Data ──\n' + 
  Object.values(studentsMap).map(s => `seedStudents["${s.id}"] = ${JSON.stringify(s, null, 2)};`).join('\n');

fs.writeFileSync(targetPath, seedContent + toAppend);
console.log('Appended ' + Object.keys(studentsMap).length + ' students to seedStudents.');
