import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';

// In-memory announcements (server-side seed)
const announcements = [
  {
    id: 'ANN-001',
    senderId: 'ADMIN001',
    targetScope: 'ALL',
    priority: 'HIGH',
    body: 'Campus gates will close at 9PM due to heavy rains.',
    timestamp: new Date().toISOString(),
  },
];

// GET /api/erp/announcements?scope=...&priority=...
export async function GET(req: NextRequest) {
  try {
    await requireAuth();
    const { searchParams } = new URL(req.url);
    const scope = searchParams.get('scope');
    const priority = searchParams.get('priority');

    let result = [...announcements].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    if (scope) result = result.filter(a => a.targetScope === scope);
    if (priority) result = result.filter(a => a.priority === priority);

    return NextResponse.json({ announcements: result, total: result.length });
  } catch (e) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

// POST /api/erp/announcements — create announcement (admin/faculty)
export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    if (!['ADMIN', 'FACULTY'].includes(session.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { targetScope, priority, body } = await req.json();
    if (!body) {
      return NextResponse.json({ error: 'body required' }, { status: 400 });
    }

    const announcement = {
      id: `ANN-${Date.now()}`,
      senderId: session.userId,
      targetScope: targetScope || 'ALL',
      priority: priority || 'NORMAL',
      body,
      timestamp: new Date().toISOString(),
    };

    announcements.push(announcement);
    return NextResponse.json({ announcement }, { status: 201 });
  } catch (e) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
