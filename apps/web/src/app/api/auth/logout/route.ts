import { NextRequest, NextResponse } from 'next/server';
import { verifyJwt } from '@/lib/jwt';
import { recordPresenceActivity } from '@/lib/presence-store';

export async function POST(req: NextRequest) {
  const token = req.cookies.get('neom_access_token')?.value;
  if (token) {
    try {
      const payload = await verifyJwt(token);
      if (payload?.role) {
        recordPresenceActivity({
          role: payload.role,
          userName: payload.fullName,
          eventType: 'LOGOUT',
          details: `${payload.fullName || payload.role} tizimdan chiqdi`,
          ip: req.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1',
          userAgent: req.headers.get('user-agent') || '',
        });
      }
    } catch {
      // ignore
    }
  }

  const isProd = process.env.NODE_ENV === 'production';
  const response = NextResponse.json({ success: true, message: 'Chiqildi' });

  // Clear session cookies completely
  response.cookies.set('neom_access_token', '', {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });

  response.cookies.set('neom_refresh_token', '', {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });

  response.cookies.set('neom_csrf_token', '', {
    httpOnly: false,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });

  return response;
}
