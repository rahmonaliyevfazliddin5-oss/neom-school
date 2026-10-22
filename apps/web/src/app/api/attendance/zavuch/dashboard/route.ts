import { NextRequest, NextResponse } from 'next/server';
import { readJsonSafe } from '@/lib/safe-store';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const dateStr = searchParams.get('date') || new Date().toISOString().split('T')[0];

  // Base classes
  const baseClasses = [
    { name: '1-A', isSubmitted: true, statusText: 'Topshirdi', attendanceRate: 100 },
    { name: '5-B', isSubmitted: true, statusText: 'Topshirdi', attendanceRate: 100 },
    { name: '9-A', isSubmitted: true, statusText: 'Topshirdi', attendanceRate: 100 },
    { name: '11-B', isSubmitted: false, statusText: 'Kutilmoqda', attendanceRate: 40 },
  ];

  // Custom classes
  const customClasses = readJsonSafe<any[]>('custom-classes.json', []);
  const attendanceRecords = readJsonSafe<Record<string, any>>('attendance-records.json', {});

  const customSubmissions = customClasses.map((c) => {
    const recordKey = `${c.id}_${dateStr}`;
    const dayRecord = attendanceRecords[recordKey];
    const isSubmitted = dayRecord?.isSubmitted ?? c.isSubmitted ?? false;
    const rate = dayRecord?.attendanceRate ?? c.attendanceRate ?? 100;

    return {
      name: c.name,
      teacher: c.teacher,
      isSubmitted: isSubmitted,
      statusText: isSubmitted ? 'Topshirdi' : 'Kutilmoqda',
      attendanceRate: rate,
    };
  });

  // Combine submissions
  const allSubmissions = [...customSubmissions, ...baseClasses];

  return NextResponse.json({
    success: true,
    summary: {
      keldi: 684 + customSubmissions.filter((c) => c.isSubmitted).length * 25,
      kelmadi: 18,
      sababli: 8,
      kechikdi: 6,
    },
    submissions: allSubmissions,
    absentees: [
      { name: 'Karimova Malika', class: '9-A', teacher: 'Nodira A.', status: 'Kelmadi', statusType: 'r' },
      { name: 'Saidova Madina', class: '9-A', teacher: 'Nodira A.', status: 'Kechikdi', statusType: 'y' },
      { name: 'Hasanov Ali', class: '9-A', teacher: 'Nodira A.', status: 'Sababli', statusType: 'y' },
      { name: 'Ergashev Bobur', class: '11-B', teacher: 'Jamshid Q.', status: 'Kelmadi', statusType: 'r' },
    ],
  });
}
