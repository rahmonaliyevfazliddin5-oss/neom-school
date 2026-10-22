import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const JWT_SECRET =
  process.env.JWT_SECRET ||
  'neom_school_super_secure_jwt_access_token_secret_key_2026_xyz_789';

function parseJwtPayload(token: string) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const json = atob(base64);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function createJwt(payload: Record<string, any>, secret: string): string {
  const header = { alg: 'HS256', typ: 'JWT' };
  const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', secret)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64url');
  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get('neom_access_token')?.value;

  if (!token) {
    return NextResponse.json({ success: false, message: 'Token yo‘q' }, { status: 401 });
  }

  const payload = parseJwtPayload(token);
  if (!payload || !payload.sub || !payload.role) {
    return NextResponse.json({ success: false, message: 'Yaroqsiz token' }, { status: 401 });
  }

  const nowSeconds = Math.floor(Date.now() / 1000);
  const refreshedPayload = {
    ...payload,
    iat: nowSeconds,
    exp: nowSeconds + 12 * 60 * 60, // extend for another 12 hours
  };

  const newAccessToken = createJwt(refreshedPayload, JWT_SECRET);
  const response = NextResponse.json({ success: true, message: 'Token yangilandi' });

  const isProd = process.env.NODE_ENV === 'production';
  response.cookies.set('neom_access_token', newAccessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    maxAge: 12 * 60 * 60,
  });

  return response;
}
