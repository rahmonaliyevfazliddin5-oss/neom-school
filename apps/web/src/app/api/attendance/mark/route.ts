import { NextRequest, NextResponse } from 'next/server';
import { readJsonSafe, writeJsonSafe } from '@/lib/safe-store';

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

    const records = readJsonSafe<Record<string, any>>('attendance-records.json', {});

    if (!records[recordKey]) {
      records[recordKey] = {
        isSubmitted: false,
        marks: {},
        attendanceRate: 100,
        updatedAt: new Date().toISOString(),
      };
    }

    records[recordKey].marks[studentId] = status;
    records[recordKey].updatedAt = new Date().toISOString();

    // Recalculate attendanceRate
    const marksList = Object.values(records[recordKey].marks);
    const presentCount = marksList.filter(
      (s) => s === 'KELDI' || s === 'KECHIKDI'
    ).length;
    if (marksList.length > 0) {
      records[recordKey].attendanceRate = Math.round(
        (presentCount / marksList.length) * 100
      );
    }

    await writeJsonSafe('attendance-records.json', records);

    return NextResponse.json({
      success: true,
      message: 'Davomat belgilandi',
      attendanceRate: records[recordKey].attendanceRate,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || 'Server xatoligi' },
      { status: 500 }
    );
  }
}
