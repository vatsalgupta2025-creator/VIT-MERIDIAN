'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Role, UserIdentity } from '@/types/canonical';
import { useUser } from './UserContext';

// Define the permissions matrix
// For demonstration, we use a simple set of resource actions.
export type Resource = 'attendance' | 'marks' | 'fees' | 'hostel' | 'placement' | 'disciplinary' | 'safety_report' | 'incident' | 'visitor' | 'wellbeing' | 'emergency' | 'communication' | 'transport' | 'complaint' | 'timetable' | 'faculty';
export type Action = 'read' | 'write' | 'admin';

const FULL_ADMIN_PERMISSIONS: Partial<Record<Resource, Action[]>> = {
  attendance: ['read', 'write', 'admin'],
  marks: ['read', 'write', 'admin'],
  fees: ['read', 'write', 'admin'],
  hostel: ['read', 'write', 'admin'],
  placement: ['read', 'write', 'admin'],
  disciplinary: ['read', 'write', 'admin'],
  communication: ['read', 'write', 'admin'],
  transport: ['read', 'write', 'admin'],
  complaint: ['read', 'write', 'admin'],
  timetable: ['read', 'write', 'admin'],
  safety_report: ['read', 'write', 'admin'],
  incident: ['read', 'write', 'admin'],
  visitor: ['read', 'write', 'admin'],
  wellbeing: ['read', 'write', 'admin'],
  emergency: ['read', 'write', 'admin'],
  faculty: ['read', 'write', 'admin'],
};

const ROLE_PERMISSIONS: Record<Role, Partial<Record<Resource, Action[]>>> = {
  STUDENT: {
    attendance: ['read'],
    marks: ['read'],
    fees: ['read'],
    hostel: ['read'],
    placement: ['read', 'write'],
    communication: ['read'],
    transport: ['read'],
    timetable: ['read'],
    complaint: ['read', 'write'],
    incident: ['read', 'write'],
    safety_report: ['write'], // Can only submit, not read others
    wellbeing: ['read', 'write'], // Can read/write own profile
  },
  FACULTY: {
    attendance: ['read', 'write'],
    marks: ['read', 'write'],
    disciplinary: ['read'],
    timetable: ['read', 'write'],
    communication: ['read', 'write'],
    complaint: ['read', 'write'],
    incident: ['write'], // Can report incidents
    faculty: ['read'],
  },
  WARDEN: {
    hostel: ['read', 'write', 'admin'],
    fees: ['read'],
    disciplinary: ['read', 'write'],
    communication: ['read', 'write'],
    complaint: ['read', 'write'],
    incident: ['read', 'write'],
  },
  HOSTEL_WARDEN: {
    hostel: ['read', 'write', 'admin'],
    fees: ['read'],
    disciplinary: ['read', 'write'],
    communication: ['read', 'write'],
    complaint: ['read', 'write'],
    incident: ['read', 'write'],
  },
  PLACEMENT_OFFICER: {
    placement: ['read', 'write', 'admin'],
    attendance: ['read'],
    marks: ['read'],
    communication: ['read', 'write'],
  },
  ADMIN: FULL_ADMIN_PERMISSIONS,
  INSTITUTION_ADMIN: FULL_ADMIN_PERMISSIONS,
  SECURITY_OFFICER: {
    visitor: ['read', 'write', 'admin'],
    incident: ['read', 'write', 'admin'],
    emergency: ['read', 'write', 'admin'],
    communication: ['read', 'write'], // For emergency broadcasts
  },
  SAFETY_OFFICER: {
    safety_report: ['read', 'write', 'admin'],
    incident: ['read', 'write', 'admin'],
    emergency: ['read', 'write', 'admin'],
    visitor: ['read'],
    disciplinary: ['read'],
  },
  COUNSELOR: {
    wellbeing: ['read', 'write', 'admin'],
    attendance: ['read'], // Can view attendance drops
    safety_report: ['read'], // Can view safety reports for context
  },
  TRANSPORT_COORD: {
    transport: ['read', 'write', 'admin'],
    communication: ['read', 'write'], // For transport notices
  },
  TRANSPORT_COORDINATOR: {
    transport: ['read', 'write', 'admin'],
    communication: ['read', 'write'], // For transport notices
  },
  DEPT_ADMIN: {
    attendance: ['read', 'admin'], // Rollups
    marks: ['read', 'admin'], // Rollups
    timetable: ['read', 'write', 'admin'],
    faculty: ['read', 'write', 'admin'],
  },
  GUARDIAN: {
    attendance: ['read'],
    marks: ['read'],
    fees: ['read'],
    communication: ['read'],
  },
};

interface RBACContextType {
  activeRole: Role;
  setActiveRole: (role: Role) => void;
  can: (action: Action, resource: Resource) => boolean;
}

const RBACContext = createContext<RBACContextType | undefined>(undefined);

export function RBACProvider({ children }: { children: ReactNode }) {
  // Default to STUDENT for now, can be overridden by a Role Switcher in UI
  const [activeRole, setActiveRole] = useState<Role>('STUDENT');

  const can = (action: Action, resource: Resource): boolean => {
    const permissions = ROLE_PERMISSIONS[activeRole];
    if (!permissions) return false;
    
    const resourcePermissions = permissions[resource];
    if (!resourcePermissions) return false;

    return resourcePermissions.includes(action) || resourcePermissions.includes('admin');
  };

  return (
    <RBACContext.Provider value={{ activeRole, setActiveRole, can }}>
      {children}
    </RBACContext.Provider>
  );
}

export function useRBAC() {
  const context = useContext(RBACContext);
  if (context === undefined) {
    throw new Error('useRBAC must be used within an RBACProvider');
  }
  return context;
}
