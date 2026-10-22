import { NextRequest, NextResponse } from 'next/server';
import { readJsonSafe, writeJsonSafe } from '@/lib/safe-store';

export async function GET() {
  const customClasses = readJsonSafe<any[]>('custom-classes.json', []);
  const customUsers = readJsonSafe<any[]>('custom-users.json', []);

  return NextResponse.json({
    success: true,
    classes: customClasses,
    teachers: customUsers,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));

    const {
      grade,
      letter,
      room,
      studentsCount,
      teacherName,
      teacherLogin,
      teacherPassword,
      createTeacherAccount,
    } = body;

    if (!grade || !letter) {
      return NextResponse.json(
        { success: false, message: 'Sinf raqami va harfi kiritilishi shart' },
        { status: 400 }
      );
    }

    const className = `${grade}-${String(letter || '').toUpperCase().trim()}`;

    // 1. Create class object
    const newClass = {
      id: `class-${Date.now()}`,
      name: className,
      grade: parseInt(grade, 10) || 1,
      letter: String(letter || 'A').toUpperCase().trim(),
      teacher: String(teacherName || '').trim(),
      teacherLogin: teacherLogin ? String(teacherLogin).trim() : null,
      teacherPassword: teacherPassword ? String(teacherPassword).trim() : null,
      studentsCount: parseInt(studentsCount, 10) || 25,
      room: String(room || '101-xona').trim(),
      attendanceRate: 100,
      isSubmitted: false,
      createdAt: new Date().toISOString(),
    };

    // Save to custom-classes.json
    const existingClasses = readJsonSafe<any[]>('custom-classes.json', []);
    const updatedClasses = existingClasses.filter(
      (c) => c.name.toLowerCase() !== className.toLowerCase()
    );
    updatedClasses.unshift(newClass);
    await writeJsonSafe('custom-classes.json', updatedClasses);

    // 2. If teacher account requested, save to custom-users.json
    let teacherAccount = null;
    if (teacherLogin && teacherPassword) {
      const existingUsers = readJsonSafe<any[]>('custom-users.json', []);
      const normalizedLogin = String(teacherLogin).trim().toLowerCase();

      teacherAccount = {
        id: `user-teacher-${Date.now()}`,
        fullName: String(teacherName || '').trim() || 'Ustoz',
        login: normalizedLogin,
        password: String(teacherPassword).trim(),
        role: 'TEACHER',
        className: className,
        createdAt: new Date().toISOString(),
      };

      const filteredUsers = existingUsers.filter(
        (u) => u.login.toLowerCase() !== normalizedLogin
      );
      filteredUsers.unshift(teacherAccount);
      await writeJsonSafe('custom-users.json', filteredUsers);
    }

    return NextResponse.json({
      success: true,
      message: `${className} sinfi va sinf rahbari akkaunti muvaffaqiyatli yaratildi!`,
      class: newClass,
      teacher: teacherAccount,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || 'Sinf yaratishda xatolik yuz berdi' },
      { status: 500 }
    );
  }
}
