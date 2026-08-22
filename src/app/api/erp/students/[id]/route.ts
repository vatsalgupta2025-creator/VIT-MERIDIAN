import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

// GET /api/erp/students/[id] — get single student with related data
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const { id } = await params;

    const student = await prisma.user.findFirst({
      where: {
        OR: [{ id }, { studentId: id }],
        role: 'STUDENT',
      },
      select: {
        id: true,
        email: true,
        name: true,
        studentId: true,
        department: true,
        year: true,
        phone: true,
        avatarUrl: true,
        createdAt: true,
        attendanceRecords: {
          orderBy: { date: 'desc' },
          take: 50,
        },
        budgetEntries: {
          orderBy: { date: 'desc' },
          take: 20,
        },
        hostelComplaints: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        timetableSlots: true,
        notifications: {
          where: { read: false },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    return NextResponse.json({ student });
  } catch (e) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

// PATCH /api/erp/students/[id] — update student info (admin/faculty)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    if (!['ADMIN', 'FACULTY'].includes(session.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();

    const allowedFields = ['name', 'phone', 'department', 'year', 'avatarUrl'];
    const data: any = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) data[field] = body[field];
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    const student = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        studentId: true,
        department: true,
        year: true,
        phone: true,
        avatarUrl: true,
      },
    });

    return NextResponse.json({ student });
  } catch (e) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
