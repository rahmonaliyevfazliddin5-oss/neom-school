import { NextRequest, NextResponse } from 'next/server';
import { readJsonSafe } from '@/lib/safe-store';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const dateStr = searchParams.get('date') || new Date().toISOString().split('T')[0];

  const customClasses = readJsonSafe<any[]>('custom-classes.json', []);
  const attendanceRecords = readJsonSafe<Record<string, any>>('attendance-records.json', {});
  const classStudentsMap = readJsonSafe<Record<string, any[]>>('class-students.json', {});

  let keldi = 0;
  let kelmadi = 0;
  let sababli = 0;
  let kechikdi = 0;
  const absentees: any[] = [];

  const submissions = customClasses.map((c) => {
    const recordKey = `${c.id}_${dateStr}`;
    const dayRecord = attendanceRecords[recordKey];
    const isSubmitted = !!dayRecord?.isSubmitted;
    const rate = dayRecord?.attendanceRate ?? (isSubmitted ? 100 : c.attendanceRate ?? 100);

    if (dayRecord && dayRecord.marks) {
      const marks = dayRecord.marks;
      const classStudents = classStudentsMap[c.name] || [];

      Object.entries(marks).forEach(([studentId, status]) => {
        if (status === 'KELDI') {
          keldi++;
        } else if (status === 'KELMADI') {
          kelmadi++;
          const std = classStudents.find((s) => s.id === studentId);
          absentees.push({
            name: std?.name || `O‘quvchi (${studentId})`,
            class: c.name,
            teacher: c.teacher || 'Ustoz',
            status: 'Kelmadi',
            statusType: 'r',
          });
        } else if (status === 'SABABLI') {
          sababli++;
          const std = classStudents.find((s) => s.id === studentId);
          absentees.push({
            name: std?.name || `O‘quvchi (${studentId})`,
            class: c.name,
            teacher: c.teacher || 'Ustoz',
            status: 'Sababli',
            statusType: 'b',
          });
        } else if (status === 'KECHIKDI') {
          kechikdi++;
          const std = classStudents.find((s) => s.id === studentId);
          absentees.push({
            name: std?.name || `O‘quvchi (${studentId})`,
            class: c.name,
            teacher: c.teacher || 'Ustoz',
            status: 'Kechikdi',
            statusType: 'y',
          });
        }
      });
    }

    return {
      name: c.name,
      teacher: c.teacher,
      isSubmitted: isSubmitted,
      statusText: isSubmitted ? 'Topshirdi' : 'Kutilmoqda',
      attendanceRate: rate,
    };
  });

  return NextResponse.json({
    success: true,
    summary: {
      keldi,
      kelmadi,
      sababli,
      kechikdi,
    },
    submissions,
    absentees,
  });
}
