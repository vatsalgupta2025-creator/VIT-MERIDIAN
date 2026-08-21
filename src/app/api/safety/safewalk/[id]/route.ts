import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { isValidSafeWalkTransition } from '@/lib/safety/safewalkStateMachine';
import { sendSafeWalkOverdueNotification } from '@/lib/safety/notificationService';

const schema = z.object({
  status: z.enum(['COMPLETED', 'OVERDUE', 'ESCALATED']),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAuth();
    const { id } = await params;
    const body = await req.json();
    const data = schema.parse(body);

    const walk = await prisma.safeWalkSession.findUnique({ where: { id } });
    if (!walk) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (walk.userId !== session.userId && session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (!isValidSafeWalkTransition(walk.status as any, data.status)) {
      return NextResponse.json({
        error: `Invalid transition: ${walk.status} → ${data.status}`,
      }, { status: 422 });
    }

    const updated = await prisma.safeWalkSession.update({
      where: { id },
      data: {
        status: data.status,
        endedAt: data.status === 'COMPLETED' ? new Date() : undefined,
        lastLatitude: data.latitude,
        lastLongitude: data.longitude,
      },
    });

    if (data.status === 'OVERDUE') {
      await sendSafeWalkOverdueNotification(walk.userId, id);
    }

    if (data.status === 'ESCALATED') {
      // Create emergency event
      await prisma.emergencyEvent.create({
        data: {
          userId: walk.userId,
          type: 'OTHER',
          latitude: data.latitude,
          longitude: data.longitude,
          status: 'ACTIVE',
          demoNote: 'DEMO — SafeWalk escalated to emergency. No external service contacted.',
        },
      });
    }

    return NextResponse.json({ session: updated });
  } catch (err) {
    if (err instanceof Response) return err;
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: err.errors }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
