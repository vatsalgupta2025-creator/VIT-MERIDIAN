import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

// GET /api/attendance?subject=...
export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth();
    const { searchParams } = new URL(req.url);
    const subject = searchParams.get('subject');

    const records = await prisma.attendanceRecord.findMany({
      where: {
        userId: session.userId,
        ...(subject ? { subject } : {}),
      },
      orderBy: { date: 'desc' },
    });

    // Aggregate per subject
    const subjectMap: Record<string, { present: number; absent: number; total: number }> = {};
    for (const r of records) {
      if (!subjectMap[r.subject]) subjectMap[r.subject] = { present: 0, absent: 0, total: 0 };
      subjectMap[r.subject].total++;
      if (r.status === 'PRESENT') subjectMap[r.subject].present++;
      if (r.status === 'ABSENT')  subjectMap[r.subject].absent++;
    }

    const summary = Object.entries(subjectMap).map(([sub, s]) => ({
      subject:    sub,
      present:    s.present,
      absent:     s.absent,
      total:      s.total,
      percentage: s.total > 0 ? Math.round((s.present / s.total) * 100) : 0,
    }));

    return NextResponse.json({ records, summary });
  } catch (e) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

// POST /api/attendance — mark attendance
export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    const { subject, date, status, notes } = await req.json();

    if (!subject || !date || !status) {
      return NextResponse.json({ error: 'subject, date and status required' }, { status: 400 });
    }

    const record = await prisma.attendanceRecord.create({
      data: {
        userId: session.userId,
        subject,
        date: new Date(date),
        status,
        notes,
      },
    });

    return NextResponse.json({ record }, { status: 201 });
  } catch (e) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
