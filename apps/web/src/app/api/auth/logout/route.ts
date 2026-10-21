import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
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
