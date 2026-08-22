import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';

const visitors = [
  {
    id: 'VIS-001',
    name: 'Rahul Sharma',
    purpose: 'Parent Visit',
    hostId: '21BCE0002',
    checkInTime: new Date(Date.now() - 28800000).toISOString(),
    checkOutTime: new Date(Date.now() - 14400000).toISOString(),
    idReference: 'DL-12345',
  },
  {
    id: 'VIS-002',
    name: 'Vendor X',
    purpose: 'Delivery',
    hostId: 'FAC001',
    checkInTime: new Date(Date.now() - 43200000).toISOString(),
    checkOutTime: undefined,
    idReference: 'UID-54321',
  },
];

// GET /api/erp/visitors
export async function GET(req: NextRequest) {
  try {
    await requireAuth();
    const activeVisitors = visitors.filter(v => !v.checkOutTime);
    return NextResponse.json({
      visitors,
      stats: { total: visitors.length, active: activeVisitors.length, checkedOut: visitors.length - activeVisitors.length },
    });
  } catch (e) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

// POST /api/erp/visitors — register visitor
export async function POST(req: NextRequest) {
  try {
    await requireAuth();
    const { name, purpose, hostId, idReference } = await req.json();

    if (!name || !purpose || !idReference) {
      return NextResponse.json({ error: 'name, purpose, idReference required' }, { status: 400 });
    }

    const visitor = {
      id: `VIS-${Date.now()}`,
      name,
      purpose,
      hostId: hostId || 'UNKNOWN',
      checkInTime: new Date().toISOString(),
      checkOutTime: undefined,
      idReference,
    };

    visitors.push(visitor);
    return NextResponse.json({ visitor }, { status: 201 });
  } catch (e) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
