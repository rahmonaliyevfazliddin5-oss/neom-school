import { NextRequest, NextResponse } from 'next/server';
import { verifyJwt } from '@/lib/jwt';
import { recordPresenceActivity } from '@/lib/presence-store';

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('neom_access_token')?.value;
    if (!token) {
      return NextResponse.json({ ok: false }, { status: 401 });
    }

    const payload = await verifyJwt(token);
    if (!payload || !payload.role) {
      return NextResponse.json({ ok: false }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const path = String(body.path || '');
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';
    const userAgent = req.headers.get('user-agent') || '';

    recordPresenceActivity({
      role: payload.role,
      userName: payload.fullName,
      path,
      ip,
      userAgent,
      eventType: 'HEARTBEAT',
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
