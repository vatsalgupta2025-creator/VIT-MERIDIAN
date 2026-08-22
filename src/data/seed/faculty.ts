import { CanonicalFaculty } from '@/types/canonical';

export const seedFaculty: Record<string, CanonicalFaculty> = {
  'FAC001': {
    id: 'FAC001',
    name: 'Dr. Venkatraman',
    department: 'SCOPE',
    designation: 'Associate Professor',
    coursesTaught: ['CSE2005', 'CSE3001'],
    leaveStatus: 'ACTIVE'
  },
  'FAC002': {
    id: 'FAC002',
    name: 'Dr. Anjali Desai',
    department: 'SCOPE',
    designation: 'Assistant Professor',
    coursesTaught: ['CSE1001', 'CSE1002'],
    leaveStatus: 'ON_LEAVE',
    leaveDates: { start: '2024-03-01', end: '2024-03-05' }
  },
};

Array.from({ length: 6 }).forEach((_, i) => {
  const id = `FAC${(i + 3).toString().padStart(3, '0')}`;
  seedFaculty[id] = {
    id,
    name: `Dr. Faculty ${i + 3}`,
    department: ['SCOPE', 'SENSE', 'SMEC', 'SELECT'][i % 4],
    designation: 'Assistant Professor',
    coursesTaught: [`COURSE${i}`],
    leaveStatus: 'ACTIVE'
  };
});
