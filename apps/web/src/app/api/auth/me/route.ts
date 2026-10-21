import { NextRequest, NextResponse } from 'next/server';

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

export async function GET(req: NextRequest) {
  const token = req.cookies.get('neom_access_token')?.value;
  if (!token) {
    return NextResponse.json({ message: 'Ruxsatsiz' }, { status: 401 });
  }

  const payload = parseJwtPayload(token);
  if (!payload || !payload.sub || !payload.role) {
    return NextResponse.json({ message: 'Ruxsatsiz' }, { status: 401 });
  }

  return NextResponse.json({
    id: payload.sub,
    fullName: payload.fullName || 'Foydalanuvchi',
    role: payload.role,
    mustChangePassword: false,
  });
}
