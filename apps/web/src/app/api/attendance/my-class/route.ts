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

const DEFAULT_NAMES = [
  'Aliyev Anvar',
  'Karimova Malika',
  'Hasanov Ali',
  'Saidova Madina',
  'Toshmatov Jasur',
  'Yusupova Rayhona',
  'Ergashev Bobur',
  'Xoliqova Ziyoda',
  'Nazarov Diyor',
  'Ismoilova Sevara',
  'Rahimov Dilshod',
  'Sobirova Kamola',
  'Vohidov Sardor',
  'Mirzayeva Lola',
  'Zokirov Temur',
  'Qosimova Shahlo',
  'Boboyev Farhod',
  'Normatova Diyora',
  'Umarov Javohir',
  'Shukurova Nigora',
  'Azimov Rustam',
  'Mansurova Madina',
  'G‘aniyev Bekzod',
  'Samatova Zarina',
  'To‘xtayev Farrux',
  'Mahmudova Munisa',
  'Karimov Shahzod',
  'Ilhomova Dilfuza',
  'Qodirova Ozoda',
  'Bekmurodov Jasurbek',
];

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

  // Load custom classes
  const customClasses = readJsonFile<any[]>('custom-classes.json', []);
  const matchedClass = customClasses.find(
    (c) => c.name?.toLowerCase() === teacherClassName.toLowerCase()
  );

  const classId = matchedClass?.id || `class-${teacherClassName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
  const studentsCount = matchedClass?.studentsCount || 26;

  // Load students for this class
  const classStudentsMap = readJsonFile<Record<string, any[]>>('class-students.json', {});
  let classStudents = classStudentsMap[teacherClassName];

  if (!classStudents || classStudents.length === 0) {
    // Generate default roster for this class
    const count = Math.min(studentsCount, DEFAULT_NAMES.length);
    classStudents = Array.from({ length: count }, (_, idx) => ({
      id: `std-${teacherClassName.replace(/[^a-zA-Z0-9]/g, '')}-${idx + 1}`,
      name: DEFAULT_NAMES[idx] || `O'quvchi ${idx + 1}`,
      phone: `+998 90 ${(100 + idx).toString()}-45-67`,
      parentName: `${DEFAULT_NAMES[idx].split(' ')[0]} Valisi`,
      parentPhone: `+998 90 ${(900 - idx).toString()}-65-43`,
      attendanceRate: 100,
    }));
    classStudentsMap[teacherClassName] = classStudents;
    writeJsonFile('class-students.json', classStudentsMap);
  }

  // Load attendance records for this class & date
  const attendanceRecords = readJsonFile<Record<string, any>>('attendance-records.json', {});
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
    teacherName: payload.fullName || matchedClass?.teacher || 'Ustoz',
    isSubmitted: !!dayRecord.isSubmitted,
    students: studentAttendance,
  });
}
