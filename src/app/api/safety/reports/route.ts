import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { generateReportId } from '@/lib/safety/reportService';

const schema = z.object({
  category: z.enum(['HARASSMENT', 'SUSPICIOUS_ACTIVITY', 'ACCIDENT', 'MEDICAL', 'THEFT', 'INFRASTRUCTURE_HAZARD', 'OTHER']),
  description: z.string().min(10).max(2000),
  location: z.string().min(3).max(200),
  incidentAt: z.string().datetime(),
});

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth();
    const reports = await prisma.safetyReport.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ reports });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await req.json();
    const data = schema.parse(body);

    const reportId = await generateReportId();

    const report = await prisma.safetyReport.create({
      data: {
        reportId,
        userId: session.userId,
        category: data.category,
        description: data.description,
        location: data.location,
        incidentAt: new Date(data.incidentAt),
      },
    });

    // Notify student of submission
    await prisma.safetyNotification.create({
      data: {
        userId: session.userId,
        title: `Report #${reportId} Submitted`,
        body: `Your incident report #${reportId} has been received and is under review.`,
      },
    });

    return NextResponse.json({ report }, { status: 201 });
  } catch (err) {
    if (err instanceof Response) return err;
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: err.errors }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
