import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

// GET /api/notifications — all notifications for the current user
export async function GET() {
  try {
    const session = await requireAuth();
    const notifications = await prisma.appNotification.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const unreadCount = notifications.filter(n => !n.read).length;
    return NextResponse.json({ notifications, unreadCount });
  } catch (e) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

// PATCH /api/notifications — mark all as read
export async function PATCH() {
  try {
    const session = await requireAuth();
    await prisma.appNotification.updateMany({
      where: { userId: session.userId, read: false },
      data:  { read: true },
    });
    return NextResponse.json({ success: true });
  } catch (e) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
