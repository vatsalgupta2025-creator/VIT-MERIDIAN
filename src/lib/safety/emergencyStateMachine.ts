// Emergency Event State Machine
// Valid transitions enforced server-side

export type EmergencyStatus = 'CREATED' | 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED' | 'CANCELLED';

const VALID_TRANSITIONS: Record<EmergencyStatus, EmergencyStatus[]> = {
  CREATED: ['ACTIVE', 'CANCELLED'],
  ACTIVE: ['ACKNOWLEDGED', 'CANCELLED'],
  ACKNOWLEDGED: ['RESOLVED', 'CANCELLED'],
  RESOLVED: [],
  CANCELLED: [],
};

export function isValidEmergencyTransition(from: EmergencyStatus, to: EmergencyStatus): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}

export function getValidEmergencyTransitions(from: EmergencyStatus): EmergencyStatus[] {
  return VALID_TRANSITIONS[from] ?? [];
}
