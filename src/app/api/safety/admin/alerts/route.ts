import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

const createSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(5).max(1000),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('MEDIUM'),
  location: z.string().max(200).optional(),
  expiresAt: z.string().datetime().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await requireAdmin();
    const body = await req.json();
    const data = createSchema.parse(body);

    const alert = await prisma.safetyAlert.create({
      data: {
        ...data,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
        active: true,
        createdBy: session.userId,
      },
    });

    return NextResponse.json({ alert }, { status: 201 });
  } catch (err) {
    if (err instanceof Response) return err;
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: err.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    await requireAdmin();
    const alerts = await prisma.safetyAlert.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ alerts });
  } catch (err) {
    if (err instanceof Response) return err;
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
