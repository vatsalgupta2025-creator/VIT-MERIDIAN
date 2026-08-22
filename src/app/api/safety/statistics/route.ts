import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET() {
  try {
    const session = await requireAuth();
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalReportsWeek,
      activeAlerts,
      totalEmergencies,
      activeEmergencies,
      totalSafeWalks,
      reportsByCategory,
      reportsByStatus,
      resolvedReports,
    ] = await Promise.all([
      prisma.safetyReport.count({ where: { createdAt: { gte: weekAgo } } }),
      prisma.safetyAlert.count({ where: { active: true } }),
      prisma.emergencyEvent.count({ where: { createdAt: { gte: monthAgo } } }),
      prisma.emergencyEvent.count({ where: { status: { in: ['ACTIVE', 'ACKNOWLEDGED'] } } }),
      prisma.safeWalkSession.count({ where: { createdAt: { gte: monthAgo } } }),
      prisma.safetyReport.groupBy({ by: ['category'], _count: { _all: true } }),
      prisma.safetyReport.groupBy({ by: ['status'], _count: { _all: true } }),
      prisma.safetyReport.count({ where: { status: 'RESOLVED' } }),
    ]);

    const totalReports = await prisma.safetyReport.count();
    const resolutionRate = totalReports > 0 ? Math.round((resolvedReports / totalReports) * 100) : 0;

    return NextResponse.json({
      totalReportsWeek,
      activeAlerts,
      totalEmergencies,
      activeEmergencies,
      totalSafeWalks,
      reportsByCategory,
      reportsByStatus,
      resolutionRate,
    });
  } catch (err) {
    if (err instanceof Response) return err;
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
