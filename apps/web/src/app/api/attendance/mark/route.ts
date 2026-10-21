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
    const { studentId, classId, date, status } = body;

    if (!studentId || !classId || !status) {
      return NextResponse.json(
        { success: false, message: 'studentId, classId va status majburiy' },
        { status: 400 }
      );
    }

    const dateStr = date || new Date().toISOString().split('T')[0];
    const recordKey = `${classId}_${dateStr}`;

    const records = readJsonFile<Record<string, any>>('attendance-records.json', {});
    if (!records[recordKey]) {
      records[recordKey] = {
        isSubmitted: false,
        marks: {},
      };
    }

    records[recordKey].marks[studentId] = status;
    writeJsonFile('attendance-records.json', records);

    return NextResponse.json({
      success: true,
      message: 'Davomat holati muvaffaqiyatli saqlandi',
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || 'Davomatni saqlashda xatolik' },
      { status: 500 }
    );
  }
}
