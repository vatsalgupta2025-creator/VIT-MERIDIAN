import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { isValidEmergencyTransition } from '@/lib/safety/emergencyStateMachine';

const schema = z.object({
  status: z.enum(['ACTIVE', 'ACKNOWLEDGED', 'RESOLVED', 'CANCELLED']),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAuth();
    const { id } = await params;
    const body = await req.json();
    const { status: newStatus } = schema.parse(body);

    const event = await prisma.emergencyEvent.findUnique({ where: { id } });
    if (!event) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // Only owner or admin can update
    if (event.userId !== session.userId && session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Enforce state machine
    if (!isValidEmergencyTransition(event.status as any, newStatus)) {
      return NextResponse.json({
        error: `Invalid transition: ${event.status} → ${newStatus}`,
      }, { status: 422 });
    }

    const updated = await prisma.emergencyEvent.update({
      where: { id },
      data: {
        status: newStatus,
        resolvedAt: newStatus === 'RESOLVED' || newStatus === 'CANCELLED' ? new Date() : undefined,
      },
    });

    if (newStatus === 'RESOLVED' || newStatus === 'CANCELLED') {
      await prisma.safetyNotification.create({
        data: {
          userId: event.userId,
          title: `Emergency ${newStatus}`,
          body: `Your emergency event has been marked as ${newStatus.toLowerCase()}.`,
        },
      });
    }

    return NextResponse.json({ event: updated });
  } catch (err) {
    if (err instanceof Response) return err;
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: err.errors }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
