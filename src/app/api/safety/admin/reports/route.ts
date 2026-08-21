import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { notifyReportStatusChange } from '@/lib/safety/notificationService';

const patchSchema = z.object({
  status: z.enum(['SUBMITTED', 'UNDER_REVIEW', 'IN_PROGRESS', 'RESOLVED', 'REJECTED']).optional(),
  adminNotes: z.string().max(1000).optional(),
});

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const category = searchParams.get('category');

    const reports = await prisma.safetyReport.findMany({
      where: {
        ...(status ? { status: status as any } : {}),
        ...(category ? { category: category as any } : {}),
      },
      include: { user: { select: { name: true, studentId: true } } },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ reports });
  } catch (err) {
    if (err instanceof Response) return err;
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
