// Parent Communication Module — Mock Data (matches schema.md)
import { hostels, centralAdmin } from './hostelsData';

export type NotificationCategory = 'attendance' | 'hostel' | 'fees' | 'discipline' | 'leave' | 'general';
export type LeaveStatus = 'pending_proctor' | 'pending_parent' | 'approved' | 'rejected' | 'cancelled';
export type LeaveType = 'outing' | 'leave' | 'emergency_leave';

export interface NotificationPrefs {
  push: boolean;
  sms: boolean;
  email: boolean;
}

export interface ParentProfile {
  id: string;
  name: string;
  phone: string;
  email: string;
  linkedStudents: string[];
  notificationPrefs: Record<NotificationCategory, NotificationPrefs>;
}

export interface StudentLink {
  studentId: string;
  name: string;
  regNo: string;
  hostelBlockId: string;
  roomNo: string;
  mentorContact: { name: string; email: string };
  verificationStatus: 'pending' | 'verified' | 'revoked';
  linkedOn: string;
  avatarInitials: string;
}

export interface DashboardSnapshot {
  attendancePercent: number;
  lastHostelCheckIn: string;
  feeStatus: 'paid' | 'due' | 'overdue';
  amountDue?: number;
  activeAlerts: number;
}

export interface LeaveRequest {
  id: string;
  studentId: string;
  type: LeaveType;
  fromDate: string;
  toDate: string;
  reason: string;
  status: LeaveStatus;
  requestedOn: string;
  proctorComment?: string;
}

export interface ParentNotification {
  id: string;
  category: NotificationCategory;
  message: string;
  date: string;
  read: boolean;
  relatedEntityId?: string;
}

export interface MessageThread {
  threadId: string;
  with: string;
  role: 'warden' | 'proctor' | 'mentor';
  email: string;
  phone?: string;
  lastMessage: string;
  lastMessageAt: string;
  unread: number;
  messages: ChatMessage[];
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: 'parent' | 'warden' | 'proctor';
  body: string;
  sentAt: string;
  readAt?: string;
}

// ── Mock Data ──────────────────────────────────────────────────────────────

export const mockParent: ParentProfile = {
  id: 'parent-001',
  name: 'Rajesh Sharma',
  phone: '+91 98765 43210',
  email: 'rajesh.sharma@gmail.com',
  linkedStudents: ['student-123', 'student-456'],
  notificationPrefs: {
    attendance: { push: true, sms: true, email: false },
    hostel: { push: true, sms: false, email: true },
    fees: { push: true, sms: true, email: true },
    discipline: { push: true, sms: true, email: true },
    leave: { push: true, sms: true, email: false },
    general: { push: true, sms: false, email: false },
  },
};

export const mockStudents: Record<string, StudentLink> = {
  'student-123': {
    studentId: 'student-123',
    name: 'Arjun Sharma',
    regNo: '22BCE1234',
    hostelBlockId: 'block-d',
    roomNo: 'D-204',
    mentorContact: { name: 'Dr. Priya Nair', email: 'priya.nair@vit.ac.in' },
    verificationStatus: 'verified',
    linkedOn: '2026-08-01',
    avatarInitials: 'AS',
  },
  'student-456': {
    studentId: 'student-456',
    name: 'Priya Sharma',
    regNo: '24BCB5678',
    hostelBlockId: 'block-b',
    roomNo: 'B-112',
    mentorContact: { name: 'Dr. Kavitha Suresh', email: 'kavitha.s@vit.ac.in' },
    verificationStatus: 'verified',
    linkedOn: '2026-08-10',
    avatarInitials: 'PS',
  },
};

export const mockSnapshots: Record<string, DashboardSnapshot> = {
  'student-123': {
    attendancePercent: 78,
    lastHostelCheckIn: '2026-08-21T21:15:00+05:30',
    feeStatus: 'paid',
    activeAlerts: 2,
  },
  'student-456': {
    attendancePercent: 91,
    lastHostelCheckIn: '2026-08-21T20:45:00+05:30',
    feeStatus: 'due',
    amountDue: 45000,
    activeAlerts: 1,
  },
};

export const mockLeaveRequests: LeaveRequest[] = [
  {
    id: 'leave-001',
    studentId: 'student-123',
    type: 'outing',
    fromDate: '2026-08-22',
    toDate: '2026-08-22',
    reason: 'Visiting home for a family function.',
    status: 'pending_parent',
    requestedOn: '2026-08-21T10:00:00+05:30',
    proctorComment: 'Verified with student. Reason is genuine.',
  },
  {
    id: 'leave-002',
    studentId: 'student-123',
    type: 'leave',
    fromDate: '2026-08-28',
    toDate: '2026-08-30',
    reason: 'Medical appointment and recovery.',
    status: 'pending_proctor',
    requestedOn: '2026-08-21T14:00:00+05:30',
  },
  {
    id: 'leave-003',
    studentId: 'student-123',
    type: 'outing',
    fromDate: '2026-08-10',
    toDate: '2026-08-10',
    reason: 'College event participation.',
    status: 'approved',
    requestedOn: '2026-08-09T09:00:00+05:30',
    proctorComment: 'Approved. Valid college activity.',
  },
  {
    id: 'leave-004',
    studentId: 'student-456',
    type: 'outing',
    fromDate: '2026-08-23',
    toDate: '2026-08-23',
    reason: 'Shopping trip with friends.',
    status: 'pending_parent',
    requestedOn: '2026-08-21T11:30:00+05:30',
    proctorComment: 'Acknowledged.',
  },
];

export const mockNotifications: ParentNotification[] = [
  {
    id: 'n-001',
    category: 'attendance',
    message: 'Arjun\'s attendance has dropped to 78% — below the 75% warning threshold in Data Structures.',
    date: '2026-08-21',
    read: false,
  },
  {
    id: 'n-002',
    category: 'leave',
    message: 'Arjun has submitted an outing request for Aug 22. Proctor has approved — your approval is pending.',
    date: '2026-08-21',
    read: false,
  },
  {
    id: 'n-003',
    category: 'hostel',
    message: 'D Block Notice: Mess timing changed to 7:00 AM – 9:00 AM for breakfast, effective Aug 25.',
    date: '2026-08-19',
    read: true,
  },
  {
    id: 'n-004',
    category: 'fees',
    message: 'Priya\'s semester fee of ₹45,000 is due by Sep 1, 2026. Please ensure timely payment via VTOP.',
    date: '2026-08-18',
    read: false,
  },
  {
    id: 'n-005',
    category: 'general',
    message: 'VIT Chennai: Independence Day celebrations scheduled on Aug 15. Students to assemble at ground by 8:00 AM.',
    date: '2026-08-14',
    read: true,
  },
  {
    id: 'n-006',
    category: 'discipline',
    message: 'Reminder: Hostel curfew is 10:00 PM for all blocks. Please remind your ward.',
    date: '2026-08-12',
    read: true,
  },
];

export const mockThreads: Record<string, MessageThread[]> = {
  'student-123': [
    {
      threadId: 'thread-warden-d',
      with: 'Dr. Trilok Nath Pandey',
      role: 'warden',
      email: 'wmhd.cc@vit.ac.in',
      phone: '044-3993 1668',
      lastMessage: 'Noted, thank you for informing us.',
      lastMessageAt: '2026-08-18T16:40:00+05:30',
      unread: 0,
      messages: [
        {
          id: 'm1', senderId: 'parent-001', senderName: 'Rajesh Sharma', senderRole: 'parent',
          body: 'Good evening Sir, Arjun will be returning on Aug 22 evening after his outing. Please be informed.',
          sentAt: '2026-08-18T14:20:00+05:30',
        },
        {
          id: 'm2', senderId: 'warden-d', senderName: 'Dr. Trilok Nath Pandey', senderRole: 'warden',
          body: 'Noted, thank you for informing us.',
          sentAt: '2026-08-18T16:40:00+05:30', readAt: '2026-08-18T16:42:00+05:30',
        },
      ],
    },
    {
      threadId: 'thread-proctor-123',
      with: 'Dr. Priya Nair',
      role: 'proctor',
      email: 'priya.nair@vit.ac.in',
      lastMessage: 'Arjun is doing well in most subjects. Attendance in DS needs attention.',
      lastMessageAt: '2026-08-15T10:00:00+05:30',
      unread: 1,
      messages: [
        {
          id: 'm3', senderId: 'proctor-001', senderName: 'Dr. Priya Nair', senderRole: 'proctor',
          body: 'Arjun is doing well in most subjects. Attendance in DS needs attention.',
          sentAt: '2026-08-15T10:00:00+05:30',
        },
      ],
    },
  ],
  'student-456': [
    {
      threadId: 'thread-warden-b',
      with: 'Ladies Hostel Administration',
      role: 'warden',
      email: 'wmhc.cc@vit.ac.in',
      phone: '044-3993 1180',
      lastMessage: 'No messages yet.',
      lastMessageAt: '2026-08-10T00:00:00+05:30',
      unread: 0,
      messages: [],
    },
  ],
};

// Helper: get hostel for a student
export function getHostelForStudent(student: StudentLink) {
  return hostels.find(h => h.id === student.hostelBlockId);
}

// Helper: get warden contacts for emergency screen
export function getEmergencyContacts(student: StudentLink) {
  const hostel = getHostelForStudent(student);
  const disciplineWarden = centralAdmin.find(a => a.role.includes('Discipline'));
  const deputyDir = centralAdmin.find(a => a.role.includes('Deputy'));
  return { hostel, disciplineWarden, deputyDir };
}
