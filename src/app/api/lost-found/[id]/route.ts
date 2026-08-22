import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

// PATCH /api/lost-found/[id] — update status or details
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAuth();
    const { id } = await params;
    const body = await req.json();

    const item = await prisma.lostFoundItem.findUnique({ where: { id } });
    if (!item || item.userId !== session.userId) {
      return NextResponse.json({ error: 'Not found or unauthorized' }, { status: 404 });
    }

    const updated = await prisma.lostFoundItem.update({
      where: { id },
      data: {
        title:       body.title       ?? item.title,
        description: body.description ?? item.description,
        status:      body.status      ?? item.status,
        location:    body.location    ?? item.location,
        contactInfo: body.contactInfo ?? item.contactInfo,
      },
    });

    return NextResponse.json({ item: updated });
  } catch (e) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

// DELETE /api/lost-found/[id]
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAuth();
    const { id } = await params;

    const item = await prisma.lostFoundItem.findUnique({ where: { id } });
    if (!item || item.userId !== session.userId) {
      return NextResponse.json({ error: 'Not found or unauthorized' }, { status: 404 });
    }

    await prisma.lostFoundItem.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
