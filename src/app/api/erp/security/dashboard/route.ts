import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

// GET /api/erp/security/dashboard — aggregated security overview
export async function GET(req: NextRequest) {
  try {
    await requireAuth();

    // Pull real data from Prisma safety models
    const [
      safetyReports,
      activeAlerts,
      emergencyEvents,
      recentSafeWalks,
    ] = await Promise.all([
      prisma.safetyReport.findMany({
        orderBy: { createdAt: 'desc' },
        take: 20,
        include: { user: { select: { name: true, studentId: true } } },
      }),
      prisma.safetyAlert.findMany({
        where: { active: true },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.emergencyEvent.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: { user: { select: { name: true, studentId: true } } },
      }),
      prisma.safeWalkSession.findMany({
        where: { status: 'ACTIVE' },
        include: { user: { select: { name: true, studentId: true } } },
      }),
    ]);

    // Aggregate stats
    const stats = {
      totalReports: safetyReports.length,
      openReports: safetyReports.filter(r => r.status !== 'RESOLVED' && r.status !== 'REJECTED').length,
      activeAlerts: activeAlerts.length,
      criticalAlerts: activeAlerts.filter(a => a.severity === 'CRITICAL').length,
      activeEmergencies: emergencyEvents.filter(e => e.status === 'ACTIVE' || e.status === 'CREATED').length,
      activeSafeWalks: recentSafeWalks.length,
    };

    // In-memory canonical incidents/visitors for augmented view
    const canonicalIncidents = [
      { id: 'INC-001', type: 'THEFT', severity: 'MEDIUM', location: 'A Block Hostel', status: 'IN_PROGRESS' },
      { id: 'INC-002', type: 'MAINTENANCE_HAZARD', severity: 'LOW', location: 'SJT 101', status: 'RESOLVED' },
    ];

    const canonicalVisitors = [
      { id: 'VIS-002', name: 'Vendor X', purpose: 'Delivery', checkOutTime: undefined, status: 'OVERDUE' },
    ];

    return NextResponse.json({
      stats,
      safetyReports,
      activeAlerts,
      emergencyEvents,
      activeSafeWalks: recentSafeWalks,
      canonicalIncidents,
      overdueVisitors: canonicalVisitors,
    });
  } catch (e) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
