import { CanonicalStudent } from '@/types/canonical';

export const seedStudents: Record<string, CanonicalStudent> = {
  // ── Student 1: The "Everything is wrong" case (for end-to-end gating demo)
  '21BCE0001': {
    id: '21BCE0001',
    personalInfo: {
      fullName: 'Arjun Kumar',
      dob: '2003-05-14',
      bloodGroup: 'O+',
      guardianName: 'Ramesh Kumar',
      guardianContact: '+91-9876543210'
    },
    enrollment: {
      program: 'B.Tech',
      branch: 'Computer Science',
      batch: '2021-2025',
      currentSemester: 6,
      status: 'ACTIVE'
    },
    academicStanding: {
      cgpa: 7.2,
      totalCreditsEarned: 120,
      activeArrears: 1,
      disciplinaryFlags: false
    },
    hostelInfo: {
      block: 'A Block',
      room: 'A-214',
      type: 'NAC',
      messType: 'SPECIAL'
    }
  },

  // ── Student 2: Resolved Incident & Wellbeing sharing
  '21BCE0002': {
    id: '21BCE0002',
    personalInfo: {
      fullName: 'Priya Sharma',
      dob: '2003-11-22',
      bloodGroup: 'B+',
      guardianName: 'Sanjay Sharma',
      guardianContact: '+91-9876543211'
    },
    enrollment: {
      program: 'B.Tech',
      branch: 'Electronics',
      batch: '2021-2025',
      currentSemester: 6,
      status: 'ACTIVE'
    },
    academicStanding: {
      cgpa: 9.4,
      totalCreditsEarned: 124,
      activeArrears: 0,
      disciplinaryFlags: false
    },
    hostelInfo: {
      block: 'B Block',
      room: 'B-101',
      type: 'AC',
      messType: 'VEG'
    }
  },

  // ── Student 3: Perfect student (Baseline)
  '21BCE0003': {
    id: '21BCE0003',
    personalInfo: {
      fullName: 'Rohan Desai',
      dob: '2002-08-15',
      bloodGroup: 'A+',
      guardianName: 'Meera Desai',
      guardianContact: '+91-9876543212'
    },
    enrollment: {
      program: 'B.Tech',
      branch: 'Mechanical',
      batch: '2021-2025',
      currentSemester: 6,
      status: 'ACTIVE'
    },
    academicStanding: {
      cgpa: 8.8,
      totalCreditsEarned: 122,
      activeArrears: 0,
      disciplinaryFlags: false
    }
  },
};

// ── Students 4-15: Generated unremarkable students
Array.from({ length: 12 }).forEach((_, i) => {
  const id = `21BCE${(i + 4).toString().padStart(4, '0')}`;
  seedStudents[id] = {
    id,
    personalInfo: {
      fullName: `Student ${i + 4}`,
      dob: '2003-01-01',
      bloodGroup: 'O+',
      guardianName: `Guardian ${i + 4}`,
      guardianContact: `+91-90000000${(i + 4).toString().padStart(2, '0')}`
    },
    enrollment: {
      program: 'B.Tech',
      branch: ['Computer Science', 'Electronics', 'Mechanical', 'Civil'][i % 4],
      batch: '2021-2025',
      currentSemester: 6,
      status: 'ACTIVE'
    },
    academicStanding: {
      cgpa: 8.0 + (i % 2),
      totalCreditsEarned: 120,
      activeArrears: 0,
      disciplinaryFlags: false
    }
  };
});
