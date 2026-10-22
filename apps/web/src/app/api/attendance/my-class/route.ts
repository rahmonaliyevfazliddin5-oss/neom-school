import { NextRequest, NextResponse } from 'next/server';
import { readJsonSafe } from '@/lib/safe-store';

function parseJwtPayload(token: string) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const json = atob(base64);
    const payload = JSON.parse(json);
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const token = req.cookies.get('neom_access_token')?.value;
  if (!token) {
    return NextResponse.json({ message: 'Ruxsatsiz' }, { status: 401 });
  }

  const payload = parseJwtPayload(token);
  if (!payload || !payload.sub) {
    return NextResponse.json({ message: 'Ruxsatsiz' }, { status: 401 });
  }

  const searchParams = req.nextUrl.searchParams;
  const dateStr = searchParams.get('date') || new Date().toISOString().split('T')[0];
  const teacherClassName = String(payload.className || '9-A').trim();

  // Load classes
  const customClasses = readJsonSafe<any[]>('custom-classes.json', []);
  const matchedClass = customClasses.find(
    (c) => c.name?.toLowerCase() === teacherClassName.toLowerCase()
  );

  const classId = matchedClass?.id || `class-${teacherClassName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;

  // Load students for this class
  const classStudentsMap = readJsonSafe<Record<string, any[]>>('class-students.json', {});
  const classStudents = classStudentsMap[teacherClassName] || [];

  // Load attendance records for this class & date
  const attendanceRecords = readJsonSafe<Record<string, any>>('attendance-records.json', {});
  const recordKey = `${classId}_${dateStr}`;
  const dayRecord = attendanceRecords[recordKey] || {
    isSubmitted: matchedClass?.isSubmitted || false,
    marks: {},
  };

  const studentAttendance = classStudents.map((s) => ({
    id: s.id,
    name: s.name,
    status: dayRecord.marks?.[s.id] || 'KELDI',
  }));

  return NextResponse.json({
    success: true,
    className: teacherClassName,
    classId: classId,
    teacherName: payload.fullName || matchedClass?.teacher || 'O‘qituvchi',
    isSubmitted: !!dayRecord.isSubmitted,
    students: studentAttendance,
  });
}
