import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

// POST /api/polls/[id]/vote
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAuth();
    const { id: pollId } = await params;
    const { selectedIdx } = await req.json();

    if (typeof selectedIdx !== 'number') {
      return NextResponse.json({ error: 'selectedIdx required' }, { status: 400 });
    }

    const poll = await prisma.poll.findUnique({ where: { id: pollId } });
    if (!poll || poll.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'Poll not found or closed' }, { status: 404 });
    }
    if (poll.expiresAt && poll.expiresAt < new Date()) {
      await prisma.poll.update({ where: { id: pollId }, data: { status: 'CLOSED' } });
      return NextResponse.json({ error: 'Poll has expired' }, { status: 410 });
    }

    const options: string[] = JSON.parse(poll.options);
    if (selectedIdx < 0 || selectedIdx >= options.length) {
      return NextResponse.json({ error: 'Invalid option index' }, { status: 400 });
    }

    // Upsert — allow changing vote
    const vote = await prisma.pollVote.upsert({
      where:  { pollId_userId: { pollId, userId: session.userId } },
      update: { selectedIdx },
      create: { pollId, userId: session.userId, selectedIdx },
    });

    // Return updated counts
    const votes = await prisma.pollVote.findMany({ where: { pollId } });
    const counts = options.map((_, i) => votes.filter(v => v.selectedIdx === i).length);

    return NextResponse.json({ vote, voteCounts: counts, totalVotes: votes.length });
  } catch (e) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
