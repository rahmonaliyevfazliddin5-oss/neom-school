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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { classId, date } = body;

    if (!classId) {
      return NextResponse.json(
        { success: false, message: 'classId majburiy' },
        { status: 400 }
      );
    }

    const dateStr = date || new Date().toISOString().split('T')[0];
    const recordKey = `${classId}_${dateStr}`;

    // Mark in attendance-records.json
    const records = readJsonFile<Record<string, any>>('attendance-records.json', {});
    if (!records[recordKey]) {
      records[recordKey] = {
        isSubmitted: true,
        marks: {},
      };
    } else {
      records[recordKey].isSubmitted = true;
    }

    // Calculate attendance percentage
    const marks = Object.values(records[recordKey].marks || {}) as string[];
    let rate = 100;
    if (marks.length > 0) {
      const presentCount = marks.filter((m) => m === 'KELDI' || m === 'KECHIKDI').length;
      rate = Math.round((presentCount / marks.length) * 100);
    }
    records[recordKey].attendanceRate = rate;
    records[recordKey].submittedAt = new Date().toISOString();
    writeJsonFile('attendance-records.json', records);

    // Update in custom-classes.json
    const customClasses = readJsonFile<any[]>('custom-classes.json', []);
    const updatedClasses = customClasses.map((c) => {
      if (c.id === classId || c.name.toLowerCase() === classId.toLowerCase().replace('class-', '')) {
        return {
          ...c,
          isSubmitted: true,
          attendanceRate: rate,
        };
      }
      return c;
    });
    writeJsonFile('custom-classes.json', updatedClasses);

    return NextResponse.json({
      success: true,
      message: 'Davomat zavuchga muvaffaqiyatli yuborildi!',
      attendanceRate: rate,
      isSubmitted: true,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || 'Davomatni yuborishda xatolik' },
      { status: 500 }
    );
  }
}
