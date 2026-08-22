import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

// GET /api/travel-pool?from=...&to=...
export async function GET(req: NextRequest) {
  try {
    await requireAuth();
    const { searchParams } = new URL(req.url);
    const from = searchParams.get('from');
    const to   = searchParams.get('to');

    const posts = await prisma.travelPost.findMany({
      where: {
        status: 'OPEN',
        departureTime: { gte: new Date() },
        ...(from ? { from: { contains: from } } : {}),
        ...(to   ? { to:   { contains: to   } } : {}),
      },
      include: {
        user:     { select: { name: true, studentId: true, phone: true } },
        requests: { select: { id: true, userId: true, status: true, seats: true } },
      },
      orderBy: { departureTime: 'asc' },
    });

    return NextResponse.json({ posts });
  } catch (e) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

// POST /api/travel-pool — create a travel post
export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    const { from, to, departureTime, availableSeats, mode, notes, fare } = await req.json();

    if (!from || !to || !departureTime || !availableSeats) {
      return NextResponse.json({ error: 'from, to, departureTime and availableSeats required' }, { status: 400 });
    }

    const post = await prisma.travelPost.create({
      data: {
        userId: session.userId,
        from, to,
        departureTime: new Date(departureTime),
        availableSeats: parseInt(availableSeats),
        mode: mode || 'CAR',
        notes,
        fare: fare ? parseFloat(fare) : null,
      },
    });

    return NextResponse.json({ post }, { status: 201 });
  } catch (e) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
