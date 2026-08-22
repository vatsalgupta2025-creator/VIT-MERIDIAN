import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';

// In-memory store initialized from seed data (server-side)
const ledgerEntries = [
  {
    id: 'FEE-1',
    studentId: '21BCE0001',
    category: 'TUITION',
    amountDue: 198000,
    amountPaid: 0,
    dueDate: new Date(Date.now() - 86400000 * 30).toISOString(),
    status: 'OVERDUE',
  },
  {
    id: 'FEE-2',
    studentId: '21BCE0001',
    category: 'HOSTEL',
    amountDue: 85000,
    amountPaid: 0,
    dueDate: new Date(Date.now() - 86400000 * 15).toISOString(),
    status: 'OVERDUE',
  },
  {
    id: 'FEE-3',
    studentId: '21BCE0002',
    category: 'TUITION',
    amountDue: 198000,
    amountPaid: 198000,
    dueDate: new Date(Date.now() + 86400000 * 30).toISOString(),
    status: 'PAID',
  },
];

// GET /api/erp/fees?studentId=...&status=...
export async function GET(req: NextRequest) {
  try {
    await requireAuth();
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get('studentId');
    const status = searchParams.get('status');

    let result = [...ledgerEntries];
    if (studentId) result = result.filter(e => e.studentId === studentId);
    if (status) result = result.filter(e => e.status === status);

    const summary = {
      totalDue: result.reduce((s, e) => s + e.amountDue, 0),
      totalPaid: result.reduce((s, e) => s + e.amountPaid, 0),
      overdueCount: result.filter(e => e.status === 'OVERDUE').length,
      paidCount: result.filter(e => e.status === 'PAID').length,
    };

    return NextResponse.json({ entries: result, summary });
  } catch (e) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

// POST /api/erp/fees — record a payment
export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    if (!['ADMIN', 'FACULTY'].includes(session.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { studentId, category, amountDue, amountPaid, dueDate } = await req.json();
    if (!studentId || !category || amountDue === undefined) {
      return NextResponse.json({ error: 'studentId, category, amountDue required' }, { status: 400 });
    }

    const entry = {
      id: `FEE-${Date.now()}`,
      studentId,
      category,
      amountDue,
      amountPaid: amountPaid || 0,
      dueDate: dueDate || new Date().toISOString(),
      status: (amountPaid || 0) >= amountDue ? 'PAID' : 'PENDING',
    };

    ledgerEntries.push(entry);
    return NextResponse.json({ entry }, { status: 201 });
  } catch (e) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
