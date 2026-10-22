import { NextRequest, NextResponse } from 'next/server';
import { readJsonSafe } from '@/lib/safe-store';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const dateStr = searchParams.get('date') || new Date().toISOString().split('T')[0];

  const customClasses = readJsonSafe<any[]>('custom-classes.json', []);
  const customUsers = readJsonSafe<any[]>('custom-users.json', []);
  const staff = readJsonSafe<any[]>('staff.json', []);
  const attendanceRecords = readJsonSafe<Record<string, any>>('attendance-records.json', {});

  const classProgress = customClasses.map((c) => {
    const recordKey = `${c.id}_${dateStr}`;
    const dayRecord = attendanceRecords[recordKey];
    const rate = dayRecord?.attendanceRate ?? (dayRecord?.isSubmitted ? 100 : c.attendanceRate ?? 100);
    return {
      name: c.name,
      percent: rate,
    };
  });

  const totalClassesCount = customClasses.length;
  const teacherStaffCount = staff.filter((s) => s.roleType === 'TEACHER').length;
  const totalTeachersCount = teacherStaffCount + customUsers.length;

  let todayRate = 0;
  if (classProgress.length > 0) {
    const sum = classProgress.reduce((acc, item) => acc + item.percent, 0);
    todayRate = Math.round(sum / classProgress.length);
  }

  return NextResponse.json({
    success: true,
    todayRate,
    monthlyRate: todayRate,
    classesCount: totalClassesCount,
    teachersCount: totalTeachersCount,
    classProgress,
  });
}
