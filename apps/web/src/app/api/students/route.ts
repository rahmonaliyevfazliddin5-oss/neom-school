import { NextRequest, NextResponse } from 'next/server';
import { readJsonSafe, writeJsonSafe } from '@/lib/safe-store';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const className = searchParams.get('className') || '9-A';

  const classStudentsMap = readJsonSafe<Record<string, any[]>>('class-students.json', {});
  const rawStudents = classStudentsMap[className] || [];

  const students = rawStudents.map((s) => ({
    ...s,
    academicYear: s.academicYear || '2026–2027',
    enrollmentDate: s.enrollmentDate || '02.09.2026',
    status: s.status || 'Faol',
  }));

  return NextResponse.json({
    success: true,
    academicYear: '2026–2027',
    className,
    students,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { className, name, phone, parentName, parentPhone } = body;

    if (!className || !name) {
      return NextResponse.json(
        { success: false, message: 'className va name majburiy' },
        { status: 400 }
      );
    }

    const classStudentsMap = readJsonSafe<Record<string, any[]>>('class-students.json', {});
    const list = classStudentsMap[className] || [];

    const nowStr = new Date().toLocaleDateString('uz-UZ', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

    const newStudent = {
      id: `std-${className.replace(/[^a-zA-Z0-9]/g, '')}-${Date.now()}`,
      name: String(name).trim(),
      phone: String(phone || '+998 90 000-00-00').trim(),
      parentName: String(parentName || 'Ota-ona').trim(),
      parentPhone: String(parentPhone || '+998 90 000-00-00').trim(),
      academicYear: '2026–2027',
      enrollmentDate: nowStr,
      status: 'Faol',
      attendanceRate: 100,
    };

    list.push(newStudent);
    classStudentsMap[className] = list;
    await writeJsonSafe('class-students.json', classStudentsMap);

    // Update studentsCount in custom-classes.json
    const customClasses = readJsonSafe<any[]>('custom-classes.json', []);
    const updatedClasses = customClasses.map((c) => {
      if (c.name.toLowerCase() === className.toLowerCase()) {
        return {
          ...c,
          studentsCount: list.length,
        };
      }
      return c;
    });
    await writeJsonSafe('custom-classes.json', updatedClasses);

    return NextResponse.json({
      success: true,
      message: 'O‘quvchi muvaffaqiyatli qo‘shildi',
      student: newStudent,
      totalCount: list.length,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || 'O‘quvchi qo‘shishda xatolik' },
      { status: 500 }
    );
  }
}
