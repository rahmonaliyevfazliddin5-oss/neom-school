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
  const customClasses = readJsonFile<any[]>('custom-classes.json', []);
  const attendanceRecords = readJsonFile<Record<string, any>>('attendance-records.json', {});

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
      { name: 'Hasanov Ali', class: '5-B', teacher: 'Dilshod R.', status: 'Kelmadi', statusType: 'r' },
      { name: 'Ergashev Bobur', class: '11-A', teacher: 'Otabek U.', status: 'Kechikdi', statusType: 'y' },
      { name: 'Xoliqova Ziyoda', class: '2-A', teacher: 'Nilufar A.', status: 'Sababli', statusType: 'b' },
    ],
  });
}
