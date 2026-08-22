import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

const schema = z.object({
  status: z.enum(['ACTIVE', 'ACKNOWLEDGED', 'RESOLVED', 'CANCELLED']),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await req.json();
    const { status } = schema.parse(body);

    const event = await prisma.emergencyEvent.findUnique({ where: { id } });
    if (!event) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const updated = await prisma.emergencyEvent.update({
      where: { id },
      data: {
        status,
        resolvedAt: status === 'RESOLVED' || status === 'CANCELLED' ? new Date() : undefined,
      },
    });

    await prisma.safetyNotification.create({
      data: {
        userId: event.userId,
        title: `Emergency ${status}`,
        body: `Your emergency event has been updated to: ${status.toLowerCase()}.`,
      },
    });

    return NextResponse.json({ event: updated });
  } catch (err) {
    if (err instanceof Response) return err;
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: err.issues }, { status: 400 });
    }
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    await requireAdmin();
    const events = await prisma.emergencyEvent.findMany({
      include: { user: { select: { name: true, studentId: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ events });
  } catch (err) {
    if (err instanceof Response) return err;
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
