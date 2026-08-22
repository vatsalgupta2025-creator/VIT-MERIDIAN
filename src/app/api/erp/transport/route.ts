import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';

const routes = [
  { id: 'RT-01', stops: ['Gate 1', 'Main Market', 'Station'], vehicleId: 'BUS-1234', driverId: 'DRV-01' },
];

const studentTransport = [
  { studentId: '21BCE0003', routeId: 'RT-01', stopId: 'Main Market' },
];

// GET /api/erp/transport
export async function GET(req: NextRequest) {
  try {
    await requireAuth();
    return NextResponse.json({ routes, studentTransport, stats: { totalRoutes: routes.length, totalStudents: studentTransport.length } });
  } catch (e) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
