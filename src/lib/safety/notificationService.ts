import { prisma } from '../prisma';

/**
 * DemoEmergencyNotificationService
 * Records notifications to the DB and logs them.
 * Structured so a real SMS/push/security integration can replace this later.
 */
export interface EmergencyNotificationPayload {
  userId: string;
  eventId: string;
  type: string;
  latitude?: number | null;
  longitude?: number | null;
}

export async function sendEmergencyNotification(payload: EmergencyNotificationPayload): Promise<void> {
  const message = `[DEMO — No external service contacted] Emergency ${payload.type} triggered by user ${payload.userId}. Event ID: ${payload.eventId}. Location: ${payload.latitude ? `${payload.latitude}, ${payload.longitude}` : 'unknown'}.`;

  console.warn('🚨 DEMO EMERGENCY NOTIFICATION:', message);

  // Notify the user themselves as a safety acknowledgment
  await prisma.safetyNotification.create({
    data: {
      userId: payload.userId,
      title: '🚨 SOS Activated — Demo Mode',
      body: `Your SOS (${payload.type}) has been recorded. DEMO — No external emergency service was contacted. Event ID: ${payload.eventId}`,
    },
  });

  // In a real system, you would call here:
  // await smsService.send(securityPhone, message);
  // await pushService.notify(securityTeam, payload);
  // await emailService.alert(securityAdmin@campus.edu, payload);
}

export async function sendSafeWalkOverdueNotification(userId: string, sessionId: string): Promise<void> {
  await prisma.safetyNotification.create({
    data: {
      userId,
      title: '⚠️ SafeWalk Overdue',
      body: `Your SafeWalk session appears to be overdue. Are you okay? Please check in.`,
    },
  });
}

export async function notifyReportStatusChange(userId: string, reportId: string, newStatus: string): Promise<void> {
  await prisma.safetyNotification.create({
    data: {
      userId,
      title: `Report #${reportId} Updated`,
      body: `Your incident report #${reportId} status has changed to: ${newStatus.replace(/_/g, ' ')}.`,
    },
  });
}
