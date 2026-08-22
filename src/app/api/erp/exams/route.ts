import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';

// In-memory exam records (server-side seed)
const examRecords = [
  {
    id: 'EX-1',
    studentId: '21BCE0002',
    courseId: 'CSE2005',
    semester: 6,
    examType: 'CAT1',
    marksObtained: 48,
    maxMarks: 50,
    status: 'PUBLISHED',
  },
  {
    id: 'EX-2',
    studentId: '21BCE0001',
    courseId: 'CSE2005',
    semester: 6,
    examType: 'FAT',
    marksObtained: null,
    maxMarks: 100,
    status: 'PENDING',
  },
];

// GET /api/erp/exams?studentId=...&courseId=...&semester=...
export async function GET(req: NextRequest) {
  try {
    await requireAuth();
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get('studentId');
    const courseId = searchParams.get('courseId');
    const semester = searchParams.get('semester');

    let result = [...examRecords];
    if (studentId) result = result.filter(e => e.studentId === studentId);
    if (courseId) result = result.filter(e => e.courseId === courseId);
    if (semester) result = result.filter(e => e.semester === parseInt(semester));

    return NextResponse.json({ exams: result, total: result.length });
  } catch (e) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

// POST /api/erp/exams — enter/update marks (faculty only)
export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    if (!['ADMIN', 'FACULTY'].includes(session.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { studentId, courseId, semester, examType, marksObtained, maxMarks } = await req.json();
    if (!studentId || !courseId || !examType) {
      return NextResponse.json({ error: 'studentId, courseId, examType required' }, { status: 400 });
    }

    const record = {
      id: `EX-${Date.now()}`,
      studentId,
      courseId,
      semester: semester || 1,
      examType,
      marksObtained: marksObtained ?? null,
      maxMarks: maxMarks || 100,
      status: marksObtained !== null && marksObtained !== undefined ? 'ENTERED' : 'PENDING',
    };

    examRecords.push(record);
    return NextResponse.json({ exam: record }, { status: 201 });
  } catch (e) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
