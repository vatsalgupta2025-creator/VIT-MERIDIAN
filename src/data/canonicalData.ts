export { seedStudents as canonicalStudents } from './seed/students';
export { seedFaculty as canonicalFaculties } from './seed/faculty';
export { 
  seedIncidents as incidents,
  seedSafetyReports as safetyReports,
  seedEmergencyAlerts as emergencyAlerts,
  seedVisitors as visitors,
  seedWellbeingProfiles as wellbeingProfiles
} from './seed/safety';
export {
  seedLedger as ledgerEntries,
  seedExams as examRecords,
  seedPlacements as placements,
  seedAnnouncements as announcements,
  seedTransport as transport,
  seedHostel as hostel,
  seedComplaints as complaints
} from './seed/operational';

// Keep any types needed
import { AttendanceRecord } from '@/types/canonical';

export const attendanceRecords: AttendanceRecord[] = [
  {
    id: 'ATT-001',
    studentId: '21BCE0001',
    courseId: 'CSE2005',
    facultyId: 'FAC001',
    totalClasses: 40,
    attendedClasses: 25, // 62.5%
    percentage: 62.5,
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'ATT-002',
    studentId: '21BCE0002',
    courseId: 'CSE2005',
    facultyId: 'FAC001',
    totalClasses: 40,
    attendedClasses: 38,
    percentage: 95.0,
    lastUpdated: new Date().toISOString()
  }
];
