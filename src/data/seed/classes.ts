import { ClassSchedule, AttendanceSlotLog, ExamRecord } from '@/types/canonical';
import { seedStudents } from './students';

const studentIds = Object.keys(seedStudents);

export const seedClasses: ClassSchedule[] = [
  {
    id: 'BACSE201-TH-AB3-104-ALL',
    courseName: 'Data Structures and Algorithms',
    facultyId: 'FAC001',
    slots: ['Mon 08:00', 'Wed 10:00', 'Fri 14:00'],
    students: studentIds.slice(0, 50) // All 50 mock students
  },
  {
    id: 'BACSE202-TH-AB1-301-ALL',
    courseName: 'Database Management Systems',
    facultyId: 'FAC001',
    slots: ['Tue 09:00', 'Thu 11:00'],
    students: studentIds.slice(0, 30) 
  }
];

export const seedAttendanceLogs: AttendanceSlotLog[] = [
  {
    id: 'LOG-1',
    classId: 'BACSE201-TH-AB3-104-ALL',
    slot: 'Mon 08:00',
    date: new Date().toISOString().split('T')[0],
    records: studentIds.slice(0, 50).map(id => ({
      studentId: id,
      status: Math.random() > 0.1 ? 'PRESENT' : 'ABSENT'
    }))
  }
];

export const seedExamRecords: ExamRecord[] = [];

studentIds.slice(0, 50).forEach((studentId, idx) => {
  seedExamRecords.push({
    id: `EXAM-CAT1-${studentId}`,
    studentId,
    courseId: 'BACSE201-TH-AB3-104-ALL',
    semester: 2,
    examType: 'CAT1',
    marksObtained: Math.floor(Math.random() * 20) + 30, // 30-50
    maxMarks: 50,
    status: 'PUBLISHED'
  });
  seedExamRecords.push({
    id: `EXAM-CAT2-${studentId}`,
    studentId,
    courseId: 'BACSE201-TH-AB3-104-ALL',
    semester: 2,
    examType: 'CAT2',
    marksObtained: Math.floor(Math.random() * 25) + 25, // 25-50
    maxMarks: 50,
    status: 'PUBLISHED'
  });
  seedExamRecords.push({
    id: `EXAM-FAT-${studentId}`,
    studentId,
    courseId: 'BACSE201-TH-AB3-104-ALL',
    semester: 2,
    examType: 'FAT',
    marksObtained: Math.floor(Math.random() * 50) + 40, // 40-100
    maxMarks: 100,
    status: 'PUBLISHED'
  });
});
