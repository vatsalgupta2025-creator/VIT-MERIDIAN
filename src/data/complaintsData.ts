// Hostel Complaints Module — Data Layer (matches schema.md + feature spec)

import { centralAdmin } from './hostelsData';

// ── Enums / types ─────────────────────────────────────────────────────────────

export type ComplaintCategory =
  | 'maintenance' | 'mess_food' | 'housekeeping' | 'wifi'
  | 'security' | 'roommate_discipline' | 'staff_conduct' | 'harassment_ragging' | 'other';

export type ComplaintStatus =
  | 'submitted' | 'acknowledged' | 'in_progress' | 'resolved' | 'closed' | 'reopened';

export type AuthorRole = 'student' | 'warden' | 'admin' | 'anonymous_student';
export type RoutingRole =
  | 'block_warden' | 'warden_maintenance' | 'warden_food'
  | 'warden_discipline' | 'director';

// ── Config tables ─────────────────────────────────────────────────────────────

export interface CategoryConfig {
  id: ComplaintCategory;
  label: string;
  icon: string;          // emoji icon
  forceAnonymous: boolean;
  descriptionPlaceholder: string;
  sensitiveNote?: string;
}

export interface RoutingRule {
  category: ComplaintCategory;
  defaultRole: RoutingRole;
  slaHours: number;
  escalationRole: RoutingRole;
  bypassBlockWarden: boolean; // true for Staff Conduct & Harassment
}

export const CATEGORY_CONFIG: CategoryConfig[] = [
  {
    id: 'maintenance',
    label: 'Maintenance',
    icon: '🔧',
    forceAnonymous: false,
    descriptionPlaceholder: 'Describe the issue — which room/area, what is broken or damaged, since when?',
  },
  {
    id: 'mess_food',
    label: 'Mess & Food',
    icon: '🍽️',
    forceAnonymous: false,
    descriptionPlaceholder: 'What happened? Which meal, which day, what was the issue with the food or service?',
  },
  {
    id: 'housekeeping',
    label: 'Housekeeping',
    icon: '🧹',
    forceAnonymous: false,
    descriptionPlaceholder: 'Describe the cleanliness issue — which area, washroom block, frequency of the problem?',
  },
  {
    id: 'wifi',
    label: 'Internet / WiFi',
    icon: '📶',
    forceAnonymous: false,
    descriptionPlaceholder: 'Describe the connectivity issue — which block/room, since when, does it affect all devices?',
  },
  {
    id: 'security',
    label: 'Security',
    icon: '🔒',
    forceAnonymous: false,
    descriptionPlaceholder: 'Describe the security concern — unauthorized entry, lost item, gate issue, or any safety concern?',
  },
  {
    id: 'roommate_discipline',
    label: 'Roommate / Discipline',
    icon: '🤝',
    forceAnonymous: false,
    descriptionPlaceholder: 'Describe the situation — noise, rule violation, conflict? You may stay anonymous if you prefer.',
  },
  {
    id: 'staff_conduct',
    label: 'Staff Conduct',
    icon: '⚠️',
    forceAnonymous: false,
    sensitiveNote: 'This goes directly to the Hostel Director and Discipline Warden — not to your block warden. Your identity is protected.',
    descriptionPlaceholder: 'Describe what happened — include date, time, location, and the person involved. Only share what you\'re comfortable with.',
  },
  {
    id: 'harassment_ragging',
    label: 'Harassment / Ragging',
    icon: '🛡️',
    forceAnonymous: true,
    sensitiveNote: 'This is submitted anonymously by default and routes directly to the Director and Discipline Warden — bypassing all block wardens entirely.',
    descriptionPlaceholder: 'Share only what you\'re comfortable sharing. No personal details are required. Describe the incident as you experienced it.',
  },
  {
    id: 'other',
    label: 'Other',
    icon: '💬',
    forceAnonymous: false,
    descriptionPlaceholder: 'Describe your concern. If it fits a specific category, choosing that will help route it faster.',
  },
];

// Config-driven routing rules (maps to complaint_routing_rules table)
export const ROUTING_RULES: RoutingRule[] = [
  { category: 'maintenance',         defaultRole: 'warden_maintenance',  slaHours: 24,  escalationRole: 'director',           bypassBlockWarden: false },
  { category: 'mess_food',           defaultRole: 'warden_food',         slaHours: 24,  escalationRole: 'director',           bypassBlockWarden: false },
  { category: 'housekeeping',        defaultRole: 'block_warden',        slaHours: 48,  escalationRole: 'warden_maintenance', bypassBlockWarden: false },
  { category: 'wifi',                defaultRole: 'block_warden',        slaHours: 48,  escalationRole: 'director',           bypassBlockWarden: false },
  { category: 'security',            defaultRole: 'warden_discipline',   slaHours: 12,  escalationRole: 'director',           bypassBlockWarden: false },
  { category: 'roommate_discipline', defaultRole: 'block_warden',        slaHours: 48,  escalationRole: 'warden_discipline',  bypassBlockWarden: false },
  { category: 'staff_conduct',       defaultRole: 'director',            slaHours: 24,  escalationRole: 'director',           bypassBlockWarden: true  },
  { category: 'harassment_ragging',  defaultRole: 'director',            slaHours: 4,   escalationRole: 'director',           bypassBlockWarden: true  },
  { category: 'other',               defaultRole: 'block_warden',        slaHours: 48,  escalationRole: 'director',           bypassBlockWarden: false },
];

export function getRoutingRule(cat: ComplaintCategory): RoutingRule {
  return ROUTING_RULES.find(r => r.category === cat)!;
}

export function getCategoryConfig(cat: ComplaintCategory): CategoryConfig {
  return CATEGORY_CONFIG.find(c => c.id === cat)!;
}

// ── Data types ────────────────────────────────────────────────────────────────

export interface ComplaintAttachment {
  id: string;
  fileUrl: string;
  uploadedAt: string;
}

export interface StatusHistoryEntry {
  status: ComplaintStatus;
  changedAt: string;
  note?: string;
  changedByRole?: AuthorRole;
}

export interface ComplaintComment {
  id: string;
  authorRole: AuthorRole;
  authorLabel: string; // display name or "Anonymous Student"
  body: string;
  createdAt: string;
}

export interface ComplaintFeedback {
  rating: 'satisfied' | 'not_satisfied';
  comment?: string;
}

export interface Complaint {
  id: string;
  trackingCode: string;
  studentId: string | null;     // null = anonymous
  category: ComplaintCategory;
  description: string;
  hostelBlockId: string;
  roomNo: string | null;
  isAnonymous: boolean;
  status: ComplaintStatus;
  assignedToRole: RoutingRole;
  assignedToLabel: string;
  createdAt: string;
  resolvedAt: string | null;
  slaDeadline: string;
  escalated: boolean;
  escalatedAt: string | null;
  attachments: ComplaintAttachment[];
  statusHistory: StatusHistoryEntry[];
  comments: ComplaintComment[];
  feedback: ComplaintFeedback | null;
}

// ── Mock data ─────────────────────────────────────────────────────────────────

export const mockComplaints: Complaint[] = [
  {
    id: 'c-001',
    trackingCode: 'HC-1042',
    studentId: 'student-self',
    category: 'maintenance',
    description: 'The ceiling fan in Room D-204 has been making loud rattling noises for the past 3 days and the speed regulator is broken. Please send a technician.',
    hostelBlockId: 'block-d',
    roomNo: 'D-204',
    isAnonymous: false,
    status: 'in_progress',
    assignedToRole: 'warden_maintenance',
    assignedToLabel: 'Warden (Maintenance)',
    createdAt: '2026-08-18T10:30:00+05:30',
    resolvedAt: null,
    slaDeadline: '2026-08-19T10:30:00+05:30',
    escalated: true,
    escalatedAt: '2026-08-19T11:00:00+05:30',
    attachments: [],
    statusHistory: [
      { status: 'submitted', changedAt: '2026-08-18T10:30:00+05:30' },
      { status: 'acknowledged', changedAt: '2026-08-18T16:00:00+05:30', note: 'Received. Technician will be assigned.', changedByRole: 'warden' },
      { status: 'in_progress', changedAt: '2026-08-19T09:00:00+05:30', note: 'Technician visit scheduled for today afternoon.', changedByRole: 'warden' },
    ],
    comments: [
      { id: 'cm1', authorRole: 'warden', authorLabel: 'Warden (Maintenance)', body: 'Acknowledged. A technician has been assigned and will visit between 2–4 PM today.', createdAt: '2026-08-18T16:00:00+05:30' },
      { id: 'cm2', authorRole: 'student', authorLabel: 'You', body: 'Thank you. Please also check the regulator — it\'s completely non-functional.', createdAt: '2026-08-18T16:30:00+05:30' },
    ],
    feedback: null,
  },
  {
    id: 'c-002',
    trackingCode: 'HC-1038',
    studentId: 'student-self',
    category: 'mess_food',
    description: 'The sambar served at dinner on Aug 15 was sour and clearly not fresh. Several students from D Block felt unwell. This has happened before.',
    hostelBlockId: 'block-d',
    roomNo: 'D-204',
    isAnonymous: false,
    status: 'resolved',
    assignedToRole: 'warden_food',
    assignedToLabel: 'Warden (Food)',
    createdAt: '2026-08-15T21:00:00+05:30',
    resolvedAt: '2026-08-17T12:00:00+05:30',
    slaDeadline: '2026-08-16T21:00:00+05:30',
    escalated: false,
    escalatedAt: null,
    attachments: [],
    statusHistory: [
      { status: 'submitted', changedAt: '2026-08-15T21:00:00+05:30' },
      { status: 'acknowledged', changedAt: '2026-08-16T08:00:00+05:30', note: 'Complaint noted. Mess caterer informed.', changedByRole: 'warden' },
      { status: 'in_progress', changedAt: '2026-08-16T14:00:00+05:30', changedByRole: 'warden' },
      { status: 'resolved', changedAt: '2026-08-17T12:00:00+05:30', note: 'Caterer warned. Additional QC checks implemented for perishables.', changedByRole: 'warden' },
    ],
    comments: [
      { id: 'cm3', authorRole: 'warden', authorLabel: 'Warden (Food)', body: 'We\'ve spoken to the caterer and implemented a mandatory freshness check before serving. This will not recur.', createdAt: '2026-08-17T12:00:00+05:30' },
    ],
    feedback: { rating: 'satisfied', comment: 'Glad it was resolved quickly.' },
  },
  {
    id: 'c-003',
    trackingCode: 'HC-ANON-7841',
    studentId: null,
    category: 'harassment_ragging',
    description: 'Certain senior students have been pressuring freshers in D Block common room late at night. Happening repeatedly.',
    hostelBlockId: 'block-d',
    roomNo: null,
    isAnonymous: true,
    status: 'acknowledged',
    assignedToRole: 'director',
    assignedToLabel: 'Director (Hostels)',
    createdAt: '2026-08-19T23:00:00+05:30',
    resolvedAt: null,
    slaDeadline: '2026-08-20T03:00:00+05:30',
    escalated: false,
    escalatedAt: null,
    attachments: [],
    statusHistory: [
      { status: 'submitted', changedAt: '2026-08-19T23:00:00+05:30' },
      { status: 'acknowledged', changedAt: '2026-08-20T00:30:00+05:30', note: 'Received and being reviewed by the Director. Thank you for reporting.', changedByRole: 'admin' },
    ],
    comments: [
      { id: 'cm4', authorRole: 'admin', authorLabel: 'Hostel Administration', body: 'Thank you for reporting this. We take such concerns very seriously. Investigation has been initiated. You do not need to take any further action.', createdAt: '2026-08-20T00:30:00+05:30' },
    ],
    feedback: null,
  },
  {
    id: 'c-004',
    trackingCode: 'HC-1044',
    studentId: 'student-self',
    category: 'wifi',
    description: 'WiFi in D-204 has been extremely slow and frequently disconnecting since Aug 17. Affects all devices. Common room WiFi works fine.',
    hostelBlockId: 'block-d',
    roomNo: 'D-204',
    isAnonymous: false,
    status: 'submitted',
    assignedToRole: 'block_warden',
    assignedToLabel: 'D Block Warden',
    createdAt: '2026-08-21T08:00:00+05:30',
    resolvedAt: null,
    slaDeadline: '2026-08-23T08:00:00+05:30',
    escalated: false,
    escalatedAt: null,
    attachments: [],
    statusHistory: [
      { status: 'submitted', changedAt: '2026-08-21T08:00:00+05:30' },
    ],
    comments: [],
    feedback: null,
  },
];

// ── Status display config ─────────────────────────────────────────────────────
export const STATUS_CONFIG: Record<ComplaintStatus, { label: string; color: string; bg: string; step: number }> = {
  submitted:    { label: 'Submitted',    color: '#94a3b8', bg: 'rgba(148,163,184,0.12)', step: 0 },
  acknowledged: { label: 'Acknowledged', color: '#60a5fa', bg: 'rgba(59,130,246,0.12)',  step: 1 },
  in_progress:  { label: 'In Progress',  color: '#fbbf24', bg: 'rgba(245,158,11,0.12)',  step: 2 },
  resolved:     { label: 'Resolved',     color: '#34d399', bg: 'rgba(16,185,129,0.12)',  step: 3 },
  closed:       { label: 'Closed',       color: '#64748b', bg: 'rgba(100,116,139,0.10)', step: 4 },
  reopened:     { label: 'Reopened',     color: '#f87171', bg: 'rgba(239,68,68,0.12)',   step: 1 },
};

export const STATUS_STEPS: ComplaintStatus[] = ['submitted', 'acknowledged', 'in_progress', 'resolved', 'closed'];

// ── Helpers ───────────────────────────────────────────────────────────────────

export function generateTrackingCode(isAnonymous: boolean): string {
  const num = Math.floor(1000 + Math.random() * 9000);
  return isAnonymous ? `HC-ANON-${num}` : `HC-${num}`;
}

export function getSlaLabel(rule: RoutingRule): string {
  if (rule.slaHours <= 4) return 'Same day';
  if (rule.slaHours <= 12) return 'Within 12 hours';
  if (rule.slaHours <= 24) return 'Within 24 hours';
  return `Within ${rule.slaHours} hours`;
}

export function getAssignedLabel(role: RoutingRole, blockName?: string): string {
  switch (role) {
    case 'block_warden':        return `${blockName || 'Block'} Warden`;
    case 'warden_maintenance':  return 'Warden (Maintenance)';
    case 'warden_food':         return 'Warden (Food & Mess)';
    case 'warden_discipline':   return 'Warden (Discipline)';
    case 'director':            return 'Director (Hostels)';
  }
}
