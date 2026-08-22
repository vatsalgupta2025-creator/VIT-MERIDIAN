import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

// POST /api/travel-pool/[id]/request — join a ride
export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAuth();
    const { id: postId } = await params;
    const { seats, message } = await _req.json();

    const post = await prisma.travelPost.findUnique({
      where: { id: postId },
      include: { requests: { where: { status: 'ACCEPTED' } } },
    });
    if (!post || post.status !== 'OPEN') {
      return NextResponse.json({ error: 'Post not found or not open' }, { status: 404 });
    }
    if (post.userId === session.userId) {
      return NextResponse.json({ error: 'Cannot request your own post' }, { status: 400 });
    }

    const acceptedSeats = post.requests.reduce((s, r) => s + r.seats, 0);
    const requestedSeats = parseInt(seats) || 1;
    if (acceptedSeats + requestedSeats > post.availableSeats) {
      return NextResponse.json({ error: 'Not enough seats available' }, { status: 400 });
    }

    const existing = await prisma.travelRequest.findFirst({
      where: { postId, userId: session.userId },
    });
    if (existing) {
      return NextResponse.json({ error: 'Already requested this ride' }, { status: 400 });
    }

    const request = await prisma.travelRequest.create({
      data: { postId, userId: session.userId, seats: requestedSeats, message },
    });

    return NextResponse.json({ request }, { status: 201 });
  } catch (e) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

// PATCH /api/travel-pool/[id]/request — post owner accepts/rejects
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAuth();
    const { id: postId } = await params;
    const { requestId, status } = await req.json();

    const post = await prisma.travelPost.findUnique({ where: { id: postId } });
    if (!post || post.userId !== session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const updated = await prisma.travelRequest.update({
      where: { id: requestId },
      data: { status },
    });

    // Auto-close post if seats are full
    const accepted = await prisma.travelRequest.aggregate({
      where: { postId, status: 'ACCEPTED' },
      _sum: { seats: true },
    });
    if ((accepted._sum.seats || 0) >= post.availableSeats) {
      await prisma.travelPost.update({ where: { id: postId }, data: { status: 'FULL' } });
    }

    return NextResponse.json({ request: updated });
  } catch (e) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
