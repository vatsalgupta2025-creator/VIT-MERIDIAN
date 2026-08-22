import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET() {
  try {
    const session = await requireAuth();
    const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [locations, recentReports] = await Promise.all([
      prisma.safetyLocation.findMany({ where: { active: true } }),
      prisma.safetyReport.findMany({
        where: { createdAt: { gte: monthAgo } },
        select: { location: true, category: true, createdAt: true },
      }),
    ]);

    // Anonymized density — group by approximate location string, no user info
    const densityMap: Record<string, number> = {};
    for (const r of recentReports) {
      const key = r.location.substring(0, 30);
      densityMap[key] = (densityMap[key] || 0) + 1;
    }

    const density = Object.entries(densityMap).map(([location, count]) => ({ location, count }));

    return NextResponse.json({ locations, density });
  } catch (err) {
    if (err instanceof Response) return err;
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
