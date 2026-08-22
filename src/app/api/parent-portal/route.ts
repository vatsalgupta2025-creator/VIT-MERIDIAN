import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

// GET /api/parent-portal — get student's info for a parent, or parent links for a student
export async function GET() {
  try {
    const session = await requireAuth();

    if (session.role === 'PARENT') {
      // Parent sees their linked students
      const links = await prisma.parentStudentLink.findMany({
        where: { parentId: session.userId, status: 'VERIFIED' },
        include: {
          student: {
            select: {
              name: true, email: true, studentId: true,
              department: true, year: true, phone: true,
              attendanceRecords: {
                orderBy: { date: 'desc' },
                take: 30,
              },
              safetyReports: {
                orderBy: { createdAt: 'desc' },
                take: 5,
                select: { reportId: true, category: true, status: true, createdAt: true },
              },
            },
          },
        },
      });
      return NextResponse.json({ links });
    } else {
      // Student sees their parent links
      const links = await prisma.parentStudentLink.findMany({
        where: { studentId: session.userId },
        include: { parent: { select: { name: true, email: true, phone: true, role: true } } },
      });
      return NextResponse.json({ links });
    }
  } catch (e) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

// POST /api/parent-portal — student invites a parent (creates pending link)
export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    const { parentEmail } = await req.json();

    if (!parentEmail) {
      return NextResponse.json({ error: 'parentEmail required' }, { status: 400 });
    }

    const parent = await prisma.user.findUnique({ where: { email: parentEmail } });
    if (!parent) {
      return NextResponse.json({ error: 'No account found for that email. Ask your parent to register first.' }, { status: 404 });
    }
    if (parent.role !== 'PARENT') {
      return NextResponse.json({ error: 'That account is not a parent account' }, { status: 400 });
    }

    const existing = await prisma.parentStudentLink.findUnique({
      where: { studentId_parentId: { studentId: session.userId, parentId: parent.id } },
    });
    if (existing) {
      return NextResponse.json({ link: existing, message: 'Link already exists' });
    }

    const link = await prisma.parentStudentLink.create({
      data: { studentId: session.userId, parentId: parent.id, status: 'PENDING' },
    });

    return NextResponse.json({ link }, { status: 201 });
  } catch (e) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
