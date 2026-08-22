import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';

const incidents = [
  {
    id: 'INC-001',
    reportedBy: '21BCE0001',
    type: 'THEFT',
    severity: 'MEDIUM',
    location: 'A Block Hostel',
    description: 'Laptop missing from room.',
    status: 'IN_PROGRESS',
    assignedTo: 'SEC_OFFICER_1',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'INC-002',
    reportedBy: 'FAC001',
    type: 'MAINTENANCE_HAZARD',
    severity: 'LOW',
    location: 'SJT 101',
    description: 'Broken projector mount.',
    status: 'RESOLVED',
    assignedTo: 'DEPT_ADMIN_1',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

// GET /api/erp/incidents?status=...&severity=...
export async function GET(req: NextRequest) {
  try {
    await requireAuth();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const severity = searchParams.get('severity');

    let result = [...incidents];
    if (status) result = result.filter(i => i.status === status);
    if (severity) result = result.filter(i => i.severity === severity);

    return NextResponse.json({
      incidents: result,
      stats: {
        total: incidents.length,
        open: incidents.filter(i => i.status === 'OPEN' || i.status === 'IN_PROGRESS').length,
        resolved: incidents.filter(i => i.status === 'RESOLVED').length,
        critical: incidents.filter(i => i.severity === 'CRITICAL' || i.severity === 'HIGH').length,
      },
    });
  } catch (e) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

// POST /api/erp/incidents — report new incident
export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    const { type, severity, location, description } = await req.json();

    if (!type || !description) {
      return NextResponse.json({ error: 'type and description required' }, { status: 400 });
    }

    const incident = {
      id: `INC-${Date.now()}`,
      reportedBy: session.userId,
      type,
      severity: severity || 'MEDIUM',
      location: location || 'Unknown',
      description,
      status: 'OPEN',
      assignedTo: undefined,
      createdAt: new Date().toISOString(),
    };

    incidents.push(incident);
    return NextResponse.json({ incident }, { status: 201 });
  } catch (e) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
