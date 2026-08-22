export type Role = 'STUDENT' | 'FACULTY' | 'WARDEN' | 'HOSTEL_WARDEN' | 'PLACEMENT_OFFICER' | 'ADMIN' | 'INSTITUTION_ADMIN' | 'SECURITY_OFFICER' | 'SAFETY_OFFICER' | 'COUNSELOR' | 'TRANSPORT_COORD' | 'TRANSPORT_COORDINATOR' | 'DEPT_ADMIN' | 'GUARDIAN';

export interface UserIdentity {
  id: string;
  role: Role;
  name: string;
  email: string;
  avatarUrl?: string;
  department?: string; // For faculty/admin
}

// The Canonical Student Record
export interface CanonicalStudent {
  id: string; // The primary key (e.g. 21BCE0001)
  personalInfo: {
    fullName: string;
    dob: string;
    bloodGroup: string;
    guardianName: string;
    guardianContact: string;
    avatarUrl?: string;
  };
  enrollment: {
    program: string;
    branch: string;
    batch: string; // e.g., 2021-2025
    currentSemester: number;
    status: 'ACTIVE' | 'ALUMNI' | 'SUSPENDED';
  };
  academicStanding: {
    cgpa: number;
    totalCreditsEarned: number;
    activeArrears: number;
    disciplinaryFlags: boolean; // E.g., malpractice history
  };
  hostelInfo?: {
    block: string;
    room: string;
    type: 'NAC' | 'AC';
    messType: 'VEG' | 'NON_VEG' | 'SPECIAL';
  };
}

// Financial Ledger (Fees)
export interface LedgerEntry {
  id: string;
  studentId: string;
  category: 'TUITION' | 'HOSTEL' | 'MESS' | 'EXAM' | 'OTHER';
  amountDue: number;
  amountPaid: number;
  dueDate: string;
  status: 'PAID' | 'PENDING' | 'OVERDUE';
}

// Attendance (Institutional Layer)
export interface AttendanceRecord {
  id: string;
  studentId: string;
  courseId: string;
  facultyId: string;
  totalClasses: number;
  attendedClasses: number;
  percentage: number;
  lastUpdated: string;
}

export interface ClassSchedule {
  id: string; // e.g., BACSE201-TH-AB3-104-ALL
  courseName: string;
  facultyId: string;
  slots: string[]; // e.g., ['Mon 08:00-08:50', 'Wed 10:00-10:50']
  students: string[]; // studentIds
}

export interface AttendanceSlotLog {
  id: string;
  classId: string;
  slot: string;
  date: string;
  records: {
    studentId: string;
    status: 'PRESENT' | 'ABSENT';
  }[];
}

// Examinations & Results
export interface ExamRecord {
  id: string;
  studentId: string;
  courseId: string;
  semester: number;
  examType: 'CAT1' | 'CAT2' | 'FAT';
  marksObtained: number | null; // Null if not yet entered
  maxMarks: number;
  status: 'PENDING' | 'ENTERED' | 'PUBLISHED';
}

// Faculty Management
export interface CanonicalFaculty {
  id: string;
  name: string;
  department: string;
  designation: string;
  coursesTaught: string[]; // Course IDs
  leaveStatus: 'ACTIVE' | 'ON_LEAVE';
  leaveDates?: { start: string; end: string };
}

// Placement Cell
export interface PlacementDrive {
  id: string;
  companyName: string;
  role: string;
  ctc: string;
  eligibility: {
    minCgpa: number;
    maxArrears: number;
    branches: string[];
    noDisciplinaryFlags: boolean;
  };
  deadline: string;
}

export interface PlacementApplication {
  id: string;
  driveId: string;
  studentId: string;
  status: 'APPLIED' | 'SHORTLISTED' | 'INTERVIEW' | 'OFFERED' | 'REJECTED';
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actorId: string;
  actorRole: Role;
  action: 'UPDATE' | 'CREATE' | 'DELETE';
  resourceType: 'MARKS' | 'ATTENDANCE' | 'FEES' | 'DISCIPLINARY' | 'SAFETY_REPORT' | 'INCIDENT' | 'VISITOR' | 'WELLBEING' | 'EMERGENCY' | 'COMMUNICATION' | 'TRANSPORT' | 'COMPLAINT' | 'TIMETABLE';
  resourceId: string;
  oldValue?: string;
  newValue: string;
}

// ── New Entities for Phase 1 ───────────────────────────────

export interface Guardian {
  id: string;
  name: string;
  contact: string;
  linkedStudentIds: string[];
}

export interface TimetableSlot {
  id: string;
  sectionId: string;
  courseId: string;
  facultyId: string;
  day: string;
  period: string;
  room: string;
}

export interface LeaveRequest {
  id: string;
  facultyId: string;
  dates: { start: string; end: string };
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  approverId?: string;
}

export interface Announcement {
  id: string;
  senderId: string;
  targetScope: string;
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  body: string;
  timestamp: string;
}

export interface Route {
  id: string;
  stops: string[];
  vehicleId: string;
  driverId: string;
}

export interface StudentTransport {
  studentId: string;
  routeId: string;
  stopId: string;
}

export interface HostelAllocation {
  studentId: string;
  block: string;
  room: string;
}

export interface InOutLog {
  id: string;
  studentId: string;
  timestamp: string;
  direction: 'IN' | 'OUT';
}

export interface Complaint {
  id: string;
  submittedBy: string;
  category: 'MAINTENANCE' | 'ACADEMIC' | 'ADMINISTRATIVE' | 'OTHER';
  body: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
  assignedTo?: string;
}

export interface SecurityEvent {
  id: string;
  type: string;
  location: string;
  reportedBy: string;
  timestamp: string;
  status: 'OPEN' | 'RESOLVED';
}

export interface EmergencyAlert {
  id: string;
  triggeredBy: string;
  scope: string;
  type: string;
  status: 'ACTIVE' | 'RESOLVED' | 'FALSE_ALARM';
  timestamp: string;
  resolvedAt?: string;
}

export interface SafetyReport {
  id: string;
  reporterId: string | null; // Null if anonymous
  category: string;
  body: string;
  assignedOfficerId?: string;
  status: 'NEW' | 'INVESTIGATING' | 'CLOSED';
  accessLog: { timestamp: string; accessedBy: string }[];
}

export interface Incident {
  id: string;
  reportedBy: string;
  type: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  location: string;
  description: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
  assignedTo?: string;
}

export interface Visitor {
  id: string;
  name: string;
  purpose: string;
  hostId: string;
  checkInTime: string;
  checkOutTime?: string;
  idReference: string;
}

export interface WellbeingProfile {
  studentId: string;
  optedInSignals: string[];
  counselorNotes: string; // Restricted to COUNSELOR role
  selfReferrals: { id: string; date: string; reason: string }[];
}

export interface SystemEvent {
  id: string;
  type: string;
  sourceModule: string;
  targetScope: string;
  payload: any;
  timestamp: string;
}
