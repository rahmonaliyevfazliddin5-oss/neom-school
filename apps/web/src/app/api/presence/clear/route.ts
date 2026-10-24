import { NextRequest, NextResponse } from 'next/server';
import { verifyJwt } from '@/lib/jwt';
import { clearPresenceLogs } from '@/lib/presence-store';

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('neom_access_token')?.value;
    if (!token) {
      return NextResponse.json({ message: 'Sahifa topilmadi' }, { status: 404 });
    }

    const payload = await verifyJwt(token);
    if (!payload || payload.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ message: 'Sahifa topilmadi' }, { status: 404 });
    }

    clearPresenceLogs();
    return NextResponse.json({ success: true, message: 'Tarix tozalandi' });
  } catch {
    return NextResponse.json({ message: 'Xatolik' }, { status: 500 });
  }
}
