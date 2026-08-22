import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const alerts = await prisma.safetyAlert.findMany({
      where: { active: true },
      orderBy: [{ severity: 'desc' }, { createdAt: 'desc' }],
    });

    return NextResponse.json({ alerts });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
