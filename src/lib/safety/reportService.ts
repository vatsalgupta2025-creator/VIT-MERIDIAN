import { prisma } from '../prisma';

/** Generates next VS-XXXX report ID */
export async function generateReportId(): Promise<string> {
  const count = await prisma.safetyReport.count();
  const next = 1001 + count;
  return `VS-${next}`;
}
