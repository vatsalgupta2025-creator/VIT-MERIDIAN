import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';

// In-memory placement data (server-side seed)
const drives = [
  {
    id: 'DRV-001',
    companyName: 'TechCorp',
    role: 'SDE 1',
    ctc: '15 LPA',
    eligibility: {
      minCgpa: 8.0,
      maxArrears: 0,
      branches: ['Computer Science', 'Electronics'],
      noDisciplinaryFlags: true,
    },
    deadline: new Date(Date.now() + 86400000 * 5).toISOString(),
  },
];

const applications = [
  { id: 'APP-001', driveId: 'DRV-001', studentId: '21BCE0001', status: 'REJECTED' },
  { id: 'APP-002', driveId: 'DRV-001', studentId: '21BCE0002', status: 'SHORTLISTED' },
];

// GET /api/erp/placements?studentId=...&driveId=...
export async function GET(req: NextRequest) {
  try {
    await requireAuth();
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get('studentId');
    const driveId = searchParams.get('driveId');

    let filteredDrives = [...drives];
    let filteredApps = [...applications];

    if (driveId) {
      filteredDrives = filteredDrives.filter(d => d.id === driveId);
      filteredApps = filteredApps.filter(a => a.driveId === driveId);
    }
    if (studentId) {
      filteredApps = filteredApps.filter(a => a.studentId === studentId);
    }

    return NextResponse.json({
      drives: filteredDrives,
      applications: filteredApps,
      stats: {
        totalDrives: drives.length,
        totalApplications: applications.length,
        shortlisted: applications.filter(a => a.status === 'SHORTLISTED').length,
        offered: applications.filter(a => a.status === 'OFFERED').length,
      },
    });
  } catch (e) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

// POST /api/erp/placements — apply for a drive
export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    const { driveId, studentId } = await req.json();

    if (!driveId) {
      return NextResponse.json({ error: 'driveId required' }, { status: 400 });
    }

    const sid = studentId || session.userId;
    const existing = applications.find(a => a.driveId === driveId && a.studentId === sid);
    if (existing) {
      return NextResponse.json({ error: 'Already applied' }, { status: 409 });
    }

    const app = {
      id: `APP-${Date.now()}`,
      driveId,
      studentId: sid,
      status: 'APPLIED' as const,
    };

    applications.push(app);
    return NextResponse.json({ application: app }, { status: 201 });
  } catch (e) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
