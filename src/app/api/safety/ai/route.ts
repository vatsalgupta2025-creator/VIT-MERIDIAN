import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { GoogleGenerativeAI } from '@google/generative-ai';

const schema = z.object({ message: z.string().min(1).max(1000) });

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await req.json();
    const { message } = schema.parse(body);

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({
        reply: 'AI Safety Assistant is unavailable — GEMINI_API_KEY not configured. For emergencies, call VIT Security at +91-416-220-2000 or use the SOS button.',
      });
    }

    // Fetch live context from DB
    const [locations, alerts] = await Promise.all([
      prisma.safetyLocation.findMany({ where: { active: true } }),
      prisma.safetyAlert.findMany({ where: { active: true } }),
    ]);

    const locationContext = locations
      .map((l) => `- ${l.name} (${l.type}): ${l.description || ''}${l.phone ? ` Phone: ${l.phone}` : ''}`)
      .join('\n');

    const alertContext = alerts.length > 0
      ? alerts.map((a) => `- [${a.severity}] ${a.title}: ${a.description}`).join('\n')
      : 'No active alerts.';

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: `You are VITGROWW SAFE AI, a campus safety assistant. Be concise, calm, and helpful.

CAMPUS SAFETY LOCATIONS:
${locationContext}

ACTIVE CAMPUS ALERTS:
${alertContext}

CRITICAL RULES:
1. Never claim you have contacted security, police, or emergency services unless a real integration has done so.
2. For life-threatening emergencies, ALWAYS direct users to use the SOS button or call security directly.
3. Provide actionable, specific guidance using the real campus location data above.
4. Do not fabricate location details not listed above.`,
    });

    const result = await model.generateContent(message);
    const reply = result.response.text();

    return NextResponse.json({ reply });
  } catch (err) {
    if (err instanceof Response) return err;
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }
    console.error('Safety AI error:', err);
    return NextResponse.json({
      reply: 'AI unavailable. For emergencies: VIT Medical Centre +91-416-220-2020, Security +91-416-220-2000.',
    });
  }
}
