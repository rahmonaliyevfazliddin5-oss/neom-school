import { NextRequest, NextResponse } from 'next/server';
import {
  getOrCreateClassReport,
  ACADEMIC_MONTHS,
  readJson,
  writeJson,
} from '@/lib/reports-store';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const className = searchParams.get('className') || '9-A';
  const periodId = searchParams.get('period') || '2026-10';

  const report = getOrCreateClassReport(className, periodId);

  return NextResponse.json({
    success: true,
    academicYear: '2026-2027',
    report,
    availableMonths: ACADEMIC_MONTHS,
  });
}
