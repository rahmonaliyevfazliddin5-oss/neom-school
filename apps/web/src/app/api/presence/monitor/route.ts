import { NextRequest, NextResponse } from 'next/server';
import { verifyJwt } from '@/lib/jwt';
import { getPresenceOverview } from '@/lib/presence-store';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('neom_access_token')?.value;
    if (!token) {
      // Return 404 to hide endpoint from discovery
      return NextResponse.json({ message: 'Sahifa topilmadi' }, { status: 404 });
    }

    const payload = await verifyJwt(token);
    if (!payload || payload.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ message: 'Sahifa topilmadi' }, { status: 404 });
    }

    const overview = getPresenceOverview();
    return NextResponse.json({
      success: true,
      data: overview,
    });
  } catch {
    return NextResponse.json({ message: 'Xatolik' }, { status: 500 });
  }
}
