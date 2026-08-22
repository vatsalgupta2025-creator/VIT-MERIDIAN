import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAuth();
    const { id } = await params;
    const slot = await prisma.timetableSlot.findUnique({ where: { id } });
    if (!slot || slot.userId !== session.userId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    await prisma.timetableSlot.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAuth();
    const { id } = await params;
    const body = await req.json();
    const slot = await prisma.timetableSlot.findUnique({ where: { id } });
    if (!slot || slot.userId !== session.userId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    const updated = await prisma.timetableSlot.update({
      where: { id },
      data: {
        subject:   body.subject   ?? slot.subject,
        code:      body.code      ?? slot.code,
        faculty:   body.faculty   ?? slot.faculty,
        room:      body.room      ?? slot.room,
        day:       body.day       ?? slot.day,
        startTime: body.startTime ?? slot.startTime,
        endTime:   body.endTime   ?? slot.endTime,
        type:      body.type      ?? slot.type,
        color:     body.color     ?? slot.color,
      },
    });
    return NextResponse.json({ slot: updated });
  } catch (e) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
