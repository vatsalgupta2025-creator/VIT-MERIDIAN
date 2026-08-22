import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

// In-memory complaints seed (for canonical types not in Prisma)
const canonicalComplaints = [
  {
    id: 'CMP-001',
    submittedBy: '21BCE0001',
    category: 'MAINTENANCE',
    body: 'AC not working in room A-214',
    status: 'OPEN',
    assignedTo: 'WARDEN',
    createdAt: new Date().toISOString(),
  },
];

// GET /api/erp/complaints — returns both Prisma hostel complaints + canonical complaints
export async function GET(req: NextRequest) {
  try {
    await requireAuth();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const category = searchParams.get('category');

    // Prisma hostel complaints
    const where: any = {};
    if (status) where.status = status;
    if (category) where.category = category;

    const hostelComplaints = await prisma.hostelComplaint.findMany({
      where,
      include: { user: { select: { name: true, studentId: true, email: true } } },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    // Canonical complaints (filtered)
    let canonical = [...canonicalComplaints];
    if (status) canonical = canonical.filter(c => c.status === status);
    if (category) canonical = canonical.filter(c => c.category === category);

    return NextResponse.json({
      hostelComplaints,
      generalComplaints: canonical,
      stats: {
        total: hostelComplaints.length + canonical.length,
        open: hostelComplaints.filter(c => c.status === 'OPEN').length + canonical.filter(c => c.status === 'OPEN').length,
        resolved: hostelComplaints.filter(c => c.status === 'RESOLVED').length + canonical.filter(c => c.status === 'RESOLVED').length,
      },
    });
  } catch (e) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

// POST /api/erp/complaints — create a general complaint
export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    const { category, body } = await req.json();

    if (!body) {
      return NextResponse.json({ error: 'body required' }, { status: 400 });
    }

    const complaint = {
      id: `CMP-${Date.now()}`,
      submittedBy: session.userId,
      category: category || 'OTHER',
      body,
      status: 'OPEN',
      assignedTo: undefined,
      createdAt: new Date().toISOString(),
    };

    canonicalComplaints.push(complaint);
    return NextResponse.json({ complaint }, { status: 201 });
  } catch (e) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
