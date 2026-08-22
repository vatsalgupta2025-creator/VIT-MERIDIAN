import { CanonicalStudent } from '@/types/canonical';

export const seedStudents: Record<string, CanonicalStudent> = {
  // ── Primary Student: Real Integration Target
  '25bce1458': {
    id: '25bce1458',
    personalInfo: {
      fullName: 'Vatsal Gupta', // Assuming user name or generic
      dob: '2005-08-20',
      bloodGroup: 'B+',
      guardianName: 'Parent Guardian',
      guardianContact: '+91-9876543210',
      avatarUrl: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=250&auto=format&fit=crop' // Generic placeholder for mock
    },
    enrollment: {
      program: 'B.Tech',
      branch: 'Computer Science',
      batch: '2025-2029',
      currentSemester: 2,
      status: 'ACTIVE'
    },
    academicStanding: {
      cgpa: 9.2,
      totalCreditsEarned: 24,
      activeArrears: 0,
      disciplinaryFlags: false
    },
    hostelInfo: {
      block: 'Q Block',
      room: 'Q-402',
      type: 'AC',
      messType: 'VEG'
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

// ── Students 4-50: Generated unremarkable students
Array.from({ length: 47 }).forEach((_, i) => {
  const count = i + 1459;
  const id = `25bce${count}`;
  seedStudents[id] = {
    id,
    personalInfo: {
      fullName: `Mock Student ${count}`,
      dob: '2005-01-01',
      bloodGroup: 'O+',
      guardianName: `Guardian ${count}`,
      guardianContact: `+91-90000000${(count % 99).toString().padStart(2, '0')}`
    },
    enrollment: {
      program: 'B.Tech',
      branch: ['Computer Science', 'Electronics', 'Mechanical', 'Civil'][i % 4],
      batch: '2025-2029',
      currentSemester: 2,
      status: 'ACTIVE'
    },
    academicStanding: {
      cgpa: 8.0 + (i % 2),
      totalCreditsEarned: 24,
      activeArrears: 0,
      disciplinaryFlags: false
    }
  };
});
