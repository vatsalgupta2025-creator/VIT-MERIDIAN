export type SafeWalkStatus = 'ACTIVE' | 'COMPLETED' | 'OVERDUE' | 'ESCALATED';

const VALID_TRANSITIONS: Record<SafeWalkStatus, SafeWalkStatus[]> = {
  ACTIVE: ['COMPLETED', 'OVERDUE'],
  OVERDUE: ['COMPLETED', 'ESCALATED'],
  COMPLETED: [],
  ESCALATED: [],
};

export function isValidSafeWalkTransition(from: SafeWalkStatus, to: SafeWalkStatus): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}
