import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { sendEmergencyNotification } from '@/lib/safety/notificationService';

const schema = z.object({
  type: z.enum(['MEDICAL', 'FIRE', 'ASSAULT', 'THEFT', 'OTHER']),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  accuracy: z.number().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await req.json();
    const data = schema.parse(body);

    const event = await prisma.emergencyEvent.create({
      data: {
        userId: session.userId,
        type: data.type,
        latitude: data.latitude,
        longitude: data.longitude,
        accuracy: data.accuracy,
        status: 'ACTIVE',
        demoNote: 'DEMO — Emergency recorded internally. No external emergency service was contacted.',
      },
    });

    // Send demo notification
    await sendEmergencyNotification({
      userId: session.userId,
      eventId: event.id,
      type: data.type,
      latitude: data.latitude,
      longitude: data.longitude,
    });

    return NextResponse.json({ event }, { status: 201 });
  } catch (err) {
    if (err instanceof Response) return err;
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: err.issues }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth();
    const events = await prisma.emergencyEvent.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });
    return NextResponse.json({ events });
  } catch (err) {
    if (err instanceof Response) return err;
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
