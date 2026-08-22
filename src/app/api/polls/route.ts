import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

// GET /api/polls — list all active polls
export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || 'ACTIVE';

    const polls = await prisma.poll.findMany({
      where: { status },
      include: {
        user:  { select: { name: true } },
        votes: { select: { selectedIdx: true, userId: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Attach my vote and vote counts to each poll
    const enriched = polls.map(p => {
      const options: string[] = JSON.parse(p.options);
      const counts = options.map((_, i) => p.votes.filter(v => v.selectedIdx === i).length);
      const myVote = p.votes.find(v => v.userId === session.userId);
      return {
        ...p,
        options,
        voteCounts: counts,
        totalVotes: p.votes.length,
        myVote: myVote?.selectedIdx ?? null,
        votes: undefined, // strip raw votes from response
      };
    });

    return NextResponse.json({ polls: enriched });
  } catch (e) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

// POST /api/polls — create a poll
export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    const { question, options, expiresAt, anonymous } = await req.json();

    if (!question || !options || !Array.isArray(options) || options.length < 2) {
      return NextResponse.json({ error: 'question and at least 2 options required' }, { status: 400 });
    }

    const poll = await prisma.poll.create({
      data: {
        userId: session.userId,
        question,
        options: JSON.stringify(options),
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        anonymous: anonymous || false,
      },
    });

    return NextResponse.json({ poll: { ...poll, options } }, { status: 201 });
  } catch (e) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
