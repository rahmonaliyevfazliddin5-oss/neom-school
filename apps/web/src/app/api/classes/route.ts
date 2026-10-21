import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

function getFilePath(filename: string): string {
  const dir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return path.join(dir, filename);
}

function readJsonFile(filename: string): any[] {
  try {
    const file = getFilePath(filename);
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf-8');
      return JSON.parse(content || '[]');
    }
  } catch {
    // Ignore error
  }
  return [];
}

function writeJsonFile(filename: string, data: any[]) {
  try {
    const file = getFilePath(filename);
    fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write JSON file:', err);
  }
}

export async function GET() {
  const customClasses = readJsonFile('custom-classes.json');
  const customUsers = readJsonFile('custom-users.json');

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
    const existingClasses = readJsonFile('custom-classes.json');
    // Prevent duplicate class name
    const updatedClasses = existingClasses.filter(
      (c) => c.name.toLowerCase() !== className.toLowerCase()
    );
    updatedClasses.unshift(newClass);
    writeJsonFile('custom-classes.json', updatedClasses);

    // 2. If teacher account requested, save to custom-users.json
    let teacherAccount = null;
    if (teacherLogin && teacherPassword) {
      const existingUsers = readJsonFile('custom-users.json');
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

      // Replace if login already exists
      const filteredUsers = existingUsers.filter(
        (u) => u.login.toLowerCase() !== normalizedLogin
      );
      filteredUsers.unshift(teacherAccount);
      writeJsonFile('custom-users.json', filteredUsers);
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
