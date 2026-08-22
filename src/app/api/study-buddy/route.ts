import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

// GET /api/study-buddy — browse active profiles (excluding self)
export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth();
    const { searchParams } = new URL(req.url);
    const subject = searchParams.get('subject');

    const profiles = await prisma.studyBuddyProfile.findMany({
      where: {
        active: true,
        userId: { not: session.userId },
        ...(subject ? { subjects: { contains: subject } } : {}),
      },
      include: {
        user: { select: { name: true, department: true, year: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Check which ones I've already matched with
    const myMatches = await prisma.studyBuddyMatch.findMany({
      where: { matchedById: session.userId },
      select: { userId: true, status: true },
    });

    const enriched = profiles.map(p => ({
      ...p,
      subjects: JSON.parse(p.subjects),
      matchStatus: myMatches.find(m => m.userId === p.userId)?.status || null,
    }));

    return NextResponse.json({ profiles: enriched });
  } catch (e) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

// PUT /api/study-buddy — upsert my profile
export async function PUT(req: NextRequest) {
  try {
    const session = await requireAuth();
    const { subjects, studyStyle, goals, bio, active } = await req.json();

    if (!subjects || !Array.isArray(subjects)) {
      return NextResponse.json({ error: 'subjects array required' }, { status: 400 });
    }

    const profile = await prisma.studyBuddyProfile.upsert({
      where:  { userId: session.userId },
      create: {
        userId: session.userId,
        subjects: JSON.stringify(subjects),
        studyStyle: studyStyle || 'FLEXIBLE',
        goals, bio,
        active: active !== undefined ? active : true,
      },
      update: {
        subjects:   JSON.stringify(subjects),
        studyStyle: studyStyle ?? undefined,
        goals:      goals      ?? undefined,
        bio:        bio        ?? undefined,
        active:     active     !== undefined ? active : undefined,
      },
    });

    return NextResponse.json({ profile: { ...profile, subjects } });
  } catch (e) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
