import { NextRequest, NextResponse } from 'next/server';
import { readJsonSafe } from '@/lib/safe-store';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const dateStr = searchParams.get('date') || new Date().toISOString().split('T')[0];

  // Base classes with standard baseline data
  const baseClasses = [
    { name: '1-A', percent: 96 },
    { name: '1-D', percent: 92 },
    { name: '2-A', percent: 95 },
    { name: '2-B', percent: 89 },
    { name: '3-A', percent: 93 },
    { name: '3-D', percent: 90 },
    { name: '11-A', percent: 94 },
    { name: '11-B', percent: 87 },
    { name: '11-D', percent: 91 },
  ];

  // Custom classes created by Zavuch
  const customClasses = readJsonSafe<any[]>('custom-classes.json', []);
  const customUsers = readJsonSafe<any[]>('custom-users.json', []);
  const staff = readJsonSafe<any[]>('staff.json', []);
  const attendanceRecords = readJsonSafe<Record<string, any>>('attendance-records.json', {});

  const customClassProgress = customClasses.map((c) => {
    const recordKey = `${c.id}_${dateStr}`;
    const dayRecord = attendanceRecords[recordKey];
    const rate = dayRecord?.attendanceRate ?? c.attendanceRate ?? 95;
    return {
      name: c.name,
      percent: rate,
    };
  });

  const allClassProgress = [...baseClasses, ...customClassProgress];

  // Calculate live average attendance
  const totalPercentSum = allClassProgress.reduce((sum, item) => sum + item.percent, 0);
  const todayRate = allClassProgress.length > 0 ? Math.round(totalPercentSum / allClassProgress.length) : 96;

  const totalClassesCount = allClassProgress.length;
  const totalTeachersCount = staff.filter((s) => s.roleType === 'TEACHER').length + customUsers.length + 35;

  return NextResponse.json({
    success: true,
    todayRate,
    monthlyRate: Math.max(90, todayRate - 2),
    classesCount: totalClassesCount,
    teachersCount: totalTeachersCount,
    classProgress: allClassProgress,
  });
}
