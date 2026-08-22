import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

// PATCH /api/hostel/complaints/[id] — admin updates status/notes
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAuth();
    const { id } = await params;
    const body = await req.json();

    const complaint = await prisma.hostelComplaint.findUnique({ where: { id } });
    if (!complaint) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // Only admin or the owner can update
    const isAdmin = session.role === 'ADMIN';
    if (!isAdmin && complaint.userId !== session.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const updated = await prisma.hostelComplaint.update({
      where: { id },
      data: {
        status:     body.status     ?? complaint.status,
        adminNotes: body.adminNotes ?? complaint.adminNotes,
        priority:   body.priority   ?? complaint.priority,
        resolvedAt: body.status === 'RESOLVED' ? new Date() : complaint.resolvedAt,
      },
    });

    return NextResponse.json({ complaint: updated });
  } catch (e) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

// DELETE /api/hostel/complaints/[id] — student can delete their own open complaint
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAuth();
    const { id } = await params;

    const complaint = await prisma.hostelComplaint.findUnique({ where: { id } });
    if (!complaint || complaint.userId !== session.userId) {
      return NextResponse.json({ error: 'Not found or unauthorized' }, { status: 404 });
    }

    await prisma.hostelComplaint.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
