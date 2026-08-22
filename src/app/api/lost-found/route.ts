import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

// GET /api/lost-found?type=LOST|FOUND&status=OPEN
export async function GET(req: NextRequest) {
  try {
    await requireAuth(); // any logged-in user can browse
    const { searchParams } = new URL(req.url);
    const type   = searchParams.get('type');
    const status = searchParams.get('status') || 'OPEN';

    const items = await prisma.lostFoundItem.findMany({
      where: {
        ...(type   ? { type }   : {}),
        ...(status ? { status } : {}),
      },
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ items });
  } catch (e) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

// POST /api/lost-found — create a listing
export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    const { title, description, type, location, contactInfo, lostAt, foundAt, imageUrl } = await req.json();

    if (!title || !description || !type) {
      return NextResponse.json({ error: 'title, description and type required' }, { status: 400 });
    }
    if (!['LOST', 'FOUND'].includes(type)) {
      return NextResponse.json({ error: 'type must be LOST or FOUND' }, { status: 400 });
    }

    const item = await prisma.lostFoundItem.create({
      data: {
        userId: session.userId,
        title, description, type, location, contactInfo, imageUrl,
        lostAt:  lostAt  ? new Date(lostAt)  : null,
        foundAt: foundAt ? new Date(foundAt) : null,
      },
    });

    return NextResponse.json({ item }, { status: 201 });
  } catch (e) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
