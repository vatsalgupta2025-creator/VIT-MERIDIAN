import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

// GET /api/hostel/complaints — my complaints or all (admin)
export async function GET() {
  try {
    const session = await requireAuth();
    const isAdmin = session.role === 'ADMIN';

    const complaints = await prisma.hostelComplaint.findMany({
      where: isAdmin ? {} : { userId: session.userId },
      include: { user: { select: { name: true, studentId: true, phone: true } } },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ complaints });
  } catch (e) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

// POST /api/hostel/complaints — file a complaint
export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    const { hostelBlock, roomNumber, title, description, category, priority } = await req.json();

    if (!hostelBlock || !title || !description) {
      return NextResponse.json({ error: 'hostelBlock, title and description required' }, { status: 400 });
    }

    const complaint = await prisma.hostelComplaint.create({
      data: {
        userId: session.userId,
        hostelBlock,
        roomNumber,
        title,
        description,
        category: category || 'OTHER',
        priority:  priority  || 'MEDIUM',
      },
    });

    return NextResponse.json({ complaint }, { status: 201 });
  } catch (e) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
