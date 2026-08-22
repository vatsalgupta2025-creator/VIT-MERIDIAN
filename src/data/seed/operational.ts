import { 
  LedgerEntry, ExamRecord, PlacementDrive, PlacementApplication,
  Announcement, Route, StudentTransport, HostelAllocation, InOutLog, Complaint
} from '@/types/canonical';

export const seedLedger: LedgerEntry[] = [
  {
    id: 'FEE-1',
    studentId: '21BCE0001',
    category: 'TUITION',
    amountDue: 198000,
    amountPaid: 0,
    dueDate: new Date(Date.now() - 86400000 * 30).toISOString(), // 30 days overdue
    status: 'OVERDUE'
  },
  {
    id: 'FEE-2',
    studentId: '21BCE0001',
    category: 'HOSTEL',
    amountDue: 85000,
    amountPaid: 0,
    dueDate: new Date(Date.now() - 86400000 * 15).toISOString(),
    status: 'OVERDUE'
  },
  {
    id: 'FEE-3',
    studentId: '21BCE0002',
    category: 'TUITION',
    amountDue: 198000,
    amountPaid: 198000,
    dueDate: new Date(Date.now() + 86400000 * 30).toISOString(),
    status: 'PAID'
  }
];

export const seedExams: ExamRecord[] = [
  {
    id: 'EX-1',
    studentId: '21BCE0002',
    courseId: 'CSE2005',
    semester: 6,
    examType: 'CAT1',
    marksObtained: 48,
    maxMarks: 50,
    status: 'PUBLISHED'
  },
  {
    id: 'EX-2',
    studentId: '21BCE0001',
    courseId: 'CSE2005',
    semester: 6,
    examType: 'FAT',
    marksObtained: null,
    maxMarks: 100,
    status: 'PENDING' // Hall ticket should be blocked for this
  }
];

export const seedPlacements: { drives: PlacementDrive[], applications: PlacementApplication[] } = {
  drives: [
    {
      id: 'DRV-001',
      companyName: 'TechCorp',
      role: 'SDE 1',
      ctc: '15 LPA',
      eligibility: { minCgpa: 8.0, maxArrears: 0, branches: ['Computer Science', 'Electronics'], noDisciplinaryFlags: true },
      deadline: new Date(Date.now() + 86400000 * 5).toISOString()
    }
  ],
  applications: [
    {
      id: 'APP-001',
      driveId: 'DRV-001',
      studentId: '21BCE0001',
      status: 'REJECTED' // Due to arrears/attendance
    },
    {
      id: 'APP-002',
      driveId: 'DRV-001',
      studentId: '21BCE0002',
      status: 'SHORTLISTED'
    }
  ]
};

export const seedAnnouncements: Announcement[] = [
  {
    id: 'ANN-001',
    senderId: 'ADMIN001',
    targetScope: 'ALL',
    priority: 'HIGH',
    body: 'Campus gates will close at 9PM due to heavy rains.',
    timestamp: new Date().toISOString()
  }
];

export const seedTransport: { routes: Route[], students: StudentTransport[] } = {
  routes: [
    { id: 'RT-01', stops: ['Gate 1', 'Main Market', 'Station'], vehicleId: 'BUS-1234', driverId: 'DRV-01' }
  ],
  students: [
    { studentId: '21BCE0003', routeId: 'RT-01', stopId: 'Main Market' }
  ]
};

export const seedHostel: { allocations: HostelAllocation[], logs: InOutLog[] } = {
  allocations: [
    { studentId: '21BCE0001', block: 'A Block', room: 'A-214' },
    { studentId: '21BCE0002', block: 'B Block', room: 'B-101' }
  ],
  logs: [
    { id: 'IOL-1', studentId: '21BCE0001', timestamp: new Date(Date.now() - 3600000).toISOString(), direction: 'OUT' }
  ]
};

export const seedComplaints: Complaint[] = [
  {
    id: 'CMP-001',
    submittedBy: '21BCE0001',
    category: 'MAINTENANCE',
    body: 'AC not working in room A-214',
    status: 'OPEN',
    assignedTo: 'WARDEN'
  }
];
