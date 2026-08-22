import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

// GET /api/budget — list all entries for authenticated user
export async function GET() {
  try {
    const session = await requireAuth();
    const entries = await prisma.budgetEntry.findMany({
      where: { userId: session.userId },
      orderBy: { date: 'desc' },
    });

    const income  = entries.filter(e => e.type === 'INCOME').reduce((s, e) => s + e.amount, 0);
    const expense = entries.filter(e => e.type === 'EXPENSE').reduce((s, e) => s + e.amount, 0);

    return NextResponse.json({ entries, summary: { income, expense, balance: income - expense } });
  } catch (e) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

// POST /api/budget — create an entry
export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    const { title, amount, type, category, description, date } = await req.json();

    if (!title || !amount || !type) {
      return NextResponse.json({ error: 'title, amount and type are required' }, { status: 400 });
    }
    if (!['INCOME', 'EXPENSE'].includes(type)) {
      return NextResponse.json({ error: 'type must be INCOME or EXPENSE' }, { status: 400 });
    }

    const entry = await prisma.budgetEntry.create({
      data: {
        userId: session.userId,
        title,
        amount: parseFloat(amount),
        type,
        category: category || 'OTHER',
        description,
        date: date ? new Date(date) : new Date(),
      },
    });

    return NextResponse.json({ entry }, { status: 201 });
  } catch (e) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
