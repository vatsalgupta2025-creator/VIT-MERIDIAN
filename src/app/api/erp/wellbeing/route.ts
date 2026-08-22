import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';

const wellbeingProfiles = [
  {
    studentId: '21BCE0002',
    optedInSignals: ['ATTENDANCE', 'ACADEMIC_PERFORMANCE'],
    counselorNotes: 'Student reported high stress due to placement pressure. Follow up next week.',
    selfReferrals: [
      { id: 'REF-001', date: new Date(Date.now() - 604800000).toISOString(), reason: 'Anxiety' },
    ],
  },
];

// GET /api/erp/wellbeing?studentId=...
export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth();
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get('studentId');

    let result = [...wellbeingProfiles];
    if (studentId) result = result.filter(p => p.studentId === studentId);

    // Restrict counselor notes unless user is ADMIN or has counselor role
    if (!['ADMIN', 'FACULTY'].includes(session.role)) {
      result = result.map(p => ({ ...p, counselorNotes: '[Restricted]' }));
    }

    return NextResponse.json({
      profiles: result,
      stats: {
        totalProfiles: wellbeingProfiles.length,
        totalReferrals: wellbeingProfiles.reduce((s, p) => s + p.selfReferrals.length, 0),
      },
    });
  } catch (e) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

// POST /api/erp/wellbeing — add self-referral
export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    const { reason } = await req.json();

    if (!reason) {
      return NextResponse.json({ error: 'reason required' }, { status: 400 });
    }

    let profile = wellbeingProfiles.find(p => p.studentId === session.userId);
    if (!profile) {
      profile = {
        studentId: session.userId,
        optedInSignals: [],
        counselorNotes: '',
        selfReferrals: [],
      };
      wellbeingProfiles.push(profile);
    }

    const referral = { id: `REF-${Date.now()}`, date: new Date().toISOString(), reason };
    profile.selfReferrals.push(referral);

    return NextResponse.json({ referral }, { status: 201 });
  } catch (e) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
