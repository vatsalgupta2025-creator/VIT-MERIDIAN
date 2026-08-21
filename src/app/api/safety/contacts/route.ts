import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

const schema = z.object({
  name: z.string().min(2).max(100),
  phone: z.string().min(7).max(20),
  relationship: z.string().min(2).max(50),
});

export async function GET() {
  try {
    const session = await requireAuth();
    const contacts = await prisma.emergencyContact.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: 'asc' },
    });
    return NextResponse.json({ contacts });
  } catch (err) {
    if (err instanceof Response) return err;
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await req.json();
    const data = schema.parse(body);

    const count = await prisma.emergencyContact.count({ where: { userId: session.userId } });
    if (count >= 5) {
      return NextResponse.json({ error: 'Maximum 5 emergency contacts allowed' }, { status: 400 });
    }

    const contact = await prisma.emergencyContact.create({
      data: { userId: session.userId, ...data },
    });
    return NextResponse.json({ contact }, { status: 201 });
  } catch (err) {
    if (err instanceof Response) return err;
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: err.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
