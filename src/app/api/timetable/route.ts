import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

// GET /api/timetable
export async function GET() {
  try {
    const session = await requireAuth();
    const slots = await prisma.timetableSlot.findMany({
      where: { userId: session.userId },
      orderBy: [{ day: 'asc' }, { startTime: 'asc' }],
    });
    return NextResponse.json({ slots });
  } catch (e) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

// POST /api/timetable
export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    const { subject, code, faculty, room, day, startTime, endTime, type, color } = await req.json();

    if (!subject || !day || !startTime || !endTime) {
      return NextResponse.json({ error: 'subject, day, startTime, endTime required' }, { status: 400 });
    }

    const slot = await prisma.timetableSlot.create({
      data: {
        userId: session.userId,
        subject, code, faculty, room,
        day, startTime, endTime,
        type: type || 'LECTURE',
        color,
      },
    });

    return NextResponse.json({ slot }, { status: 201 });
  } catch (e) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
