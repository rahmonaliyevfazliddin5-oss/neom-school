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

function readJsonFile<T>(filename: string, defaultValue: T): T {
  try {
    const file = getFilePath(filename);
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf-8');
      return JSON.parse(content || 'null') ?? defaultValue;
    }
  } catch {
    // Ignore error
  }
  return defaultValue;
}

function writeJsonFile(filename: string, data: any) {
  try {
    const file = getFilePath(filename);
    fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write JSON file:', err);
  }
}

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const className = searchParams.get('className') || '9-A';

  const classStudentsMap = readJsonFile<Record<string, any[]>>('class-students.json', {});
  const students = classStudentsMap[className] || [];

  return NextResponse.json({
    success: true,
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

    const classStudentsMap = readJsonFile<Record<string, any[]>>('class-students.json', {});
    const list = classStudentsMap[className] || [];

    const newStudent = {
      id: `std-${className.replace(/[^a-zA-Z0-9]/g, '')}-${Date.now()}`,
      name: String(name).trim(),
      phone: String(phone || '+998 90 000-00-00').trim(),
      parentName: String(parentName || 'Ota-ona').trim(),
      parentPhone: String(parentPhone || '+998 90 000-00-00').trim(),
      attendanceRate: 100,
    };

    list.push(newStudent);
    classStudentsMap[className] = list;
    writeJsonFile('class-students.json', classStudentsMap);

    // Update studentsCount in custom-classes.json
    const customClasses = readJsonFile<any[]>('custom-classes.json', []);
    const updatedClasses = customClasses.map((c) => {
      if (c.name.toLowerCase() === className.toLowerCase()) {
        return {
          ...c,
          studentsCount: list.length,
        };
      }
      return c;
    });
    writeJsonFile('custom-classes.json', updatedClasses);

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
