import { NextRequest, NextResponse } from 'next/server';
import { verifyJwt } from '@/lib/jwt';

export async function GET(req: NextRequest) {
  const token = req.cookies.get('neom_access_token')?.value;
  if (!token) {
    return NextResponse.json({ message: 'Ruxsatsiz' }, { status: 401 });
  }

  const payload = await verifyJwt(token);
  if (!payload || !payload.sub || !payload.role) {
    return NextResponse.json({ message: 'Ruxsatsiz' }, { status: 401 });
  }

  return NextResponse.json({
    id: payload.sub,
    fullName: payload.fullName || 'Foydalanuvchi',
    role: payload.role,
    className: payload.className || (payload.role === 'TEACHER' ? '9-A' : undefined),
    mustChangePassword: false,
  });
}
