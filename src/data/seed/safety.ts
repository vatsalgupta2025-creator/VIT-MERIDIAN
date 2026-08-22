import { Incident, SafetyReport, EmergencyAlert, Visitor, WellbeingProfile } from '@/types/canonical';

export const seedIncidents: Incident[] = [
  {
    id: 'INC-001',
    reportedBy: '21BCE0001',
    type: 'THEFT',
    severity: 'MEDIUM',
    location: 'A Block Hostel',
    description: 'Laptop missing from room.',
    status: 'IN_PROGRESS',
    assignedTo: 'SEC_OFFICER_1'
  },
  {
    id: 'INC-002',
    reportedBy: 'FAC001',
    type: 'MAINTENANCE_HAZARD',
    severity: 'LOW',
    location: 'SJT 101',
    description: 'Broken projector mount.',
    status: 'RESOLVED',
    assignedTo: 'DEPT_ADMIN_1'
  }
];

export const seedSafetyReports: SafetyReport[] = [
  {
    id: 'SAF-001',
    reporterId: null, // Anonymous
    category: 'HARASSMENT',
    body: 'Inappropriate comments near food court.',
    assignedOfficerId: 'SAF_OFFICER_1',
    status: 'INVESTIGATING',
    accessLog: [{ timestamp: new Date(Date.now() - 3600000).toISOString(), accessedBy: 'SAF_OFFICER_1' }]
  },
  {
    id: 'SAF-002',
    reporterId: '21BCE0002',
    category: 'STALKING',
    body: 'Followed from library to hostel.',
    assignedOfficerId: 'SAF_OFFICER_1',
    status: 'CLOSED',
    accessLog: [{ timestamp: new Date(Date.now() - 86400000).toISOString(), accessedBy: 'SAF_OFFICER_1' }]
  }
];

export const seedEmergencyAlerts: EmergencyAlert[] = [
  {
    id: 'EMG-001',
    triggeredBy: '21BCE0004',
    scope: 'CAMPUS',
    type: 'MEDICAL',
    status: 'RESOLVED',
    timestamp: new Date(Date.now() - 172800000).toISOString(),
    resolvedAt: new Date(Date.now() - 170000000).toISOString()
  },
  {
    id: 'EMG-002',
    triggeredBy: '21BCE0005',
    scope: 'HOSTEL_B',
    type: 'FIRE',
    status: 'FALSE_ALARM',
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    resolvedAt: new Date(Date.now() - 86350000).toISOString()
  }
];

export const seedVisitors: Visitor[] = [
  {
    id: 'VIS-001',
    name: 'Rahul Sharma',
    purpose: 'Parent Visit',
    hostId: '21BCE0002',
    checkInTime: new Date(Date.now() - 28800000).toISOString(), // 8 hours ago
    checkOutTime: new Date(Date.now() - 14400000).toISOString(),
    idReference: 'DL-12345'
  },
  {
    id: 'VIS-002',
    name: 'Vendor X',
    purpose: 'Delivery',
    hostId: 'FAC001',
    checkInTime: new Date(Date.now() - 43200000).toISOString(), // 12 hours ago
    // Overdue checkout
    idReference: 'UID-54321'
  }
];

export const seedWellbeingProfiles: WellbeingProfile[] = [
  {
    studentId: '21BCE0002',
    optedInSignals: ['ATTENDANCE', 'ACADEMIC_PERFORMANCE'],
    counselorNotes: 'Student reported high stress due to placement pressure. Follow up next week.',
    selfReferrals: [
      { id: 'REF-001', date: new Date(Date.now() - 604800000).toISOString(), reason: 'Anxiety' }
    ]
  }
];
