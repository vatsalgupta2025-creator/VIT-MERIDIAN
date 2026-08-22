import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { notifyReportStatusChange } from '@/lib/safety/notificationService';

const schema = z.object({
  status: z.enum(['SUBMITTED', 'UNDER_REVIEW', 'IN_PROGRESS', 'RESOLVED', 'REJECTED']).optional(),
  adminNotes: z.string().max(1000).optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await req.json();
    const data = schema.parse(body);

    const existing = await prisma.safetyReport.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const updated = await prisma.safetyReport.update({
      where: { id },
      data,
    });

    if (data.status && data.status !== existing.status) {
      await notifyReportStatusChange(existing.userId, existing.reportId, data.status);
    }

    return NextResponse.json({ report: updated });
  } catch (err) {
    if (err instanceof Response) return err;
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: err.issues }, { status: 400 });
    }
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
