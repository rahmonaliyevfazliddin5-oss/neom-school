import { NextRequest, NextResponse } from 'next/server';
import { readJsonSafe, writeJsonSafe } from '@/lib/safe-store';

export interface StaffItem {
  id: string;
  fullName: string;
  role: string;
  roleType: 'DIRECTOR' | 'ZAVUCH' | 'TEACHER';
  subjectOrClass: string;
  phone: string;
  isActive: boolean;
  joinedDate: string;
}

export async function GET() {
  const staff = readJsonSafe<StaffItem[]>('staff.json', []);
  const customUsers = readJsonSafe<any[]>('custom-users.json', []);

  // Merge custom users created by Zavuch into staff view
  const customStaff: StaffItem[] = customUsers.map((u) => ({
    id: u.id || `custom-teacher-${u.login}`,
    fullName: u.fullName || 'Ustoz',
    role: `Sinf rahbari / O‘qituvchi`,
    roleType: u.role || 'TEACHER',
    subjectOrClass: `${u.className || 'Maktab'} sinf rahbari`,
    phone: u.phone || '+998 90 000 00 00',
    isActive: true,
    joinedDate: u.createdAt ? u.createdAt.split('T')[0] : '2026-10-21',
  }));

  const allStaff = [...staff, ...customStaff];

  return NextResponse.json({
    success: true,
    data: allStaff,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { fullName, role, roleType, subjectOrClass, phone } = body;

    if (!fullName?.trim() || !subjectOrClass?.trim()) {
      return NextResponse.json(
        { success: false, message: 'F.I.SH va fan ma’lumotini kiriting' },
        { status: 400 }
      );
    }

    const staff = readJsonSafe<StaffItem[]>('staff.json', []);

    let roleTitle = role || 'Fan o‘qituvchisi';
    if (roleType === 'DIRECTOR') roleTitle = 'Direktorat a’zosi';
    if (roleType === 'ZAVUCH') roleTitle = 'O‘quv bo‘limi / Zavuch';

    const newMember: StaffItem = {
      id: `st-${Date.now()}`,
      fullName: fullName.trim(),
      role: roleTitle,
      roleType: roleType || 'TEACHER',
      subjectOrClass: subjectOrClass.trim(),
      phone: phone?.trim() || '+998 90 000 00 00',
      isActive: true,
      joinedDate: new Date().toISOString().split('T')[0],
    };

    const updated = [newMember, ...staff];
    await writeJsonSafe('staff.json', updated);

    return NextResponse.json({
      success: true,
      data: newMember,
      message: 'Yangi xodim muvaffaqiyatli saqlandi',
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || 'Server xatoligi' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'ID ko‘rsatilmadi' },
        { status: 400 }
      );
    }

    const staff = readJsonSafe<StaffItem[]>('staff.json', []);
    const filtered = staff.filter((s) => s.id !== id);
    await writeJsonSafe('staff.json', filtered);

    return NextResponse.json({
      success: true,
      message: 'Xodim o‘chirildi',
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || 'Server xatoligi' },
      { status: 500 }
    );
  }
}
