import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

const schema = z.object({
  startLocation: z.string().min(3).max(200),
  destination: z.string().min(3).max(200),
  expectedArrival: z.string().datetime(),
});

export async function GET() {
  try {
    const session = await requireAuth();
    const session_ = await prisma.safeWalkSession.findFirst({
      where: { userId: session.userId, status: { in: ['ACTIVE', 'OVERDUE'] } },
      orderBy: { startedAt: 'desc' },
    });
    return NextResponse.json({ session: session_ });
  } catch (err) {
    if (err instanceof Response) return err;
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await req.json();
    const data = schema.parse(body);

    // Cancel any existing active walk
    await prisma.safeWalkSession.updateMany({
      where: { userId: session.userId, status: 'ACTIVE' },
      data: { status: 'COMPLETED', endedAt: new Date() },
    });

    const walk = await prisma.safeWalkSession.create({
      data: {
        userId: session.userId,
        startLocation: data.startLocation,
        destination: data.destination,
        expectedArrival: new Date(data.expectedArrival),
        status: 'ACTIVE',
      },
    });

    return NextResponse.json({ session: walk }, { status: 201 });
  } catch (err) {
    if (err instanceof Response) return err;
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: err.issues }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
