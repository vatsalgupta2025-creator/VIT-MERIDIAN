import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

// DELETE /api/budget/[id]
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAuth();
    const { id } = await params;

    const entry = await prisma.budgetEntry.findUnique({ where: { id } });
    if (!entry || entry.userId !== session.userId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    await prisma.budgetEntry.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

// PATCH /api/budget/[id]
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAuth();
    const { id } = await params;
    const body = await req.json();

    const entry = await prisma.budgetEntry.findUnique({ where: { id } });
    if (!entry || entry.userId !== session.userId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const updated = await prisma.budgetEntry.update({
      where: { id },
      data: {
        title:       body.title       ?? entry.title,
        amount:      body.amount      ? parseFloat(body.amount) : entry.amount,
        type:        body.type        ?? entry.type,
        category:    body.category    ?? entry.category,
        description: body.description ?? entry.description,
        date:        body.date        ? new Date(body.date) : entry.date,
      },
    });

    return NextResponse.json({ entry: updated });
  } catch (e) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
