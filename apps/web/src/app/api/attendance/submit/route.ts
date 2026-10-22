import { NextRequest, NextResponse } from 'next/server';
import { readJsonSafe, writeJsonSafe } from '@/lib/safe-store';

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
    const records = readJsonSafe<Record<string, any>>('attendance-records.json', {});

    if (!records[recordKey]) {
      records[recordKey] = {
        isSubmitted: true,
        marks: {},
        attendanceRate: 100,
        submittedAt: new Date().toISOString(),
      };
    } else {
      records[recordKey].isSubmitted = true;
      records[recordKey].submittedAt = new Date().toISOString();
    }

    await writeJsonSafe('attendance-records.json', records);

    // Also update custom-classes.json if this class is a custom class
    const customClasses = readJsonSafe<any[]>('custom-classes.json', []);
    const clsIndex = customClasses.findIndex((c) => c.id === classId);
    if (clsIndex !== -1) {
      customClasses[clsIndex].isSubmitted = true;
      if (records[recordKey]?.attendanceRate !== undefined) {
        customClasses[clsIndex].attendanceRate = records[recordKey].attendanceRate;
      }
      await writeJsonSafe('custom-classes.json', customClasses);
    }

    return NextResponse.json({
      success: true,
      message: 'Davomat zavuchga muvaffaqiyatli topshirildi!',
      record: records[recordKey],
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || 'Server xatoligi' },
      { status: 500 }
    );
  }
}
