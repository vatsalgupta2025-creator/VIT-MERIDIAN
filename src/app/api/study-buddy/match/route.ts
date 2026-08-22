import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

// POST /api/study-buddy/match — send a match request to another user's profile
export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    const { targetUserId, message } = await req.json();

    if (!targetUserId) {
      return NextResponse.json({ error: 'targetUserId required' }, { status: 400 });
    }

    const profile = await prisma.studyBuddyProfile.findUnique({ where: { userId: targetUserId } });
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const existing = await prisma.studyBuddyMatch.findFirst({
      where: { userId: targetUserId, matchedById: session.userId },
    });
    if (existing) {
      return NextResponse.json({ error: 'Already sent a match request', match: existing }, { status: 409 });
    }

    const match = await prisma.studyBuddyMatch.create({
      data: {
        userId:      targetUserId,
        matchedById: session.userId,
        profileId:   profile.id,
        message,
      },
    });

    return NextResponse.json({ match }, { status: 201 });
  } catch (e) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

// GET /api/study-buddy/match — get my incoming match requests
export async function GET() {
  try {
    const session = await requireAuth();

    const incoming = await prisma.studyBuddyMatch.findMany({
      where: { userId: session.userId },
      include: { matchedBy: { select: { name: true, department: true, year: true } } },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ matches: incoming });
  } catch (e) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

// PATCH /api/study-buddy/match — accept or reject a match request
export async function PATCH(req: NextRequest) {
  try {
    const session = await requireAuth();
    const { matchId, status } = await req.json();

    if (!matchId || !['ACCEPTED', 'REJECTED'].includes(status)) {
      return NextResponse.json({ error: 'matchId and status (ACCEPTED|REJECTED) required' }, { status: 400 });
    }

    const match = await prisma.studyBuddyMatch.findUnique({ where: { id: matchId } });
    if (!match || match.userId !== session.userId) {
      return NextResponse.json({ error: 'Not found or unauthorized' }, { status: 404 });
    }

    const updated = await prisma.studyBuddyMatch.update({
      where: { id: matchId },
      data:  { status },
    });

    return NextResponse.json({ match: updated });
  } catch (e) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
