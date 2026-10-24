import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { createJwt, JWT_SECRET } from '@/lib/jwt';
import { recordPresenceActivity } from '@/lib/presence-store';

interface UserAccount {
  id: string;
  logins: string[];
  passwords: string[];
  role: 'DIRECTOR' | 'ZAVUCH' | 'TEACHER' | 'SUPER_ADMIN';
  name: string;
  className?: string;
  redirectUrl: string;
}

function getCustomUsers(): UserAccount[] {
  try {
    const dataDir = path.join(process.cwd(), 'data');
    const filePath = path.join(dataDir, 'custom-users.json');
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      const list = JSON.parse(content || '[]');
      if (Array.isArray(list)) {
        return list.map((item: any) => ({
          id: item.id || `custom-${Date.now()}`,
          logins: [item.login],
          passwords: [item.password],
          role: item.role || 'TEACHER',
          name: item.fullName || 'Ustoz',
          className: item.className || '9-A',
          redirectUrl:
            item.role === 'DIRECTOR'
              ? '/panel/direktor'
              : item.role === 'ZAVUCH'
                ? '/panel/zavuch'
                : '/panel/ustoz',
        }));
      }
    }
  } catch {
    // Ignore read error
  }
  return [];
}

const USERS: UserAccount[] = [
  {
    id: 'user-direktor-001',
    logins: ['admin1', 'direktor', 'director'],
    passwords: [process.env.SEED_DIRECTOR_PASSWORD || 'admin1', 'admin1', 'direktor123'],
    role: 'DIRECTOR',
    name: 'Direktor',
    redirectUrl: '/panel/direktor',
  },
  {
    id: 'user-zavuch-002',
    logins: ['admin2', 'zamdrektor', 'zamdirektor', 'zavuch'],
    passwords: [process.env.SEED_ZAVUCH_PASSWORD || 'admin2', 'admin2', 'zamdrektor123'],
    role: 'ZAVUCH',
    name: 'Zavuch',
    redirectUrl: '/panel/zavuch',
  },
  {
    id: 'user-teacher-003',
    logins: ['admin3', "o'qituvchi", 'oqituvchi', 'o‘qituvchi', 'teacher1'],
    passwords: [process.env.SEED_TEACHER_PASSWORD || 'admin3', 'admin3', "o'qituvchi", 'oqituvchi'],
    role: 'TEACHER',
    name: 'O‘qituvchi',
    className: '9-A',
    redirectUrl: '/panel/ustoz',
  },
  {
    id: 'user-superadmin-0727',
    logins: ['admin0727'],
    passwords: [process.env.SEED_SUPERADMIN_PASSWORD || 'admin0727'],
    role: 'SUPER_ADMIN',
    name: 'Nazoratchi (Super Admin)',
    redirectUrl: '/panel/super-admin',
  },
];

// In-memory brute-force rate limiter: ip -> { count, resetAt }
const failedAttempts = new Map<string, { count: number; resetAt: number }>();

function isIpRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = failedAttempts.get(ip);
  if (!entry) return false;
  if (now > entry.resetAt) {
    failedAttempts.delete(ip);
    return false;
  }
  return entry.count >= 30; // Max 30 failed attempts per 60s
}

function recordFailedAttempt(ip: string) {
  const now = Date.now();
  const entry = failedAttempts.get(ip);
  if (!entry || now > entry.resetAt) {
    failedAttempts.set(ip, { count: 1, resetAt: now + 60 * 1000 });
  } else {
    entry.count += 1;
  }
}

function clearFailedAttempts(ip: string) {
  failedAttempts.delete(ip);
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';

    if (isIpRateLimited(ip)) {
      return NextResponse.json(
        { success: false, message: 'Ko‘p marta xato urinishlar qilindi. Iltimos, 1 daqiqadan so‘ng qayta urinib ko‘ring.' },
        { status: 429, headers: { 'Retry-After': '60' } }
      );
    }

    const body = await req.json().catch(() => ({}));
    const rawLogin = String(body.login || '').trim().toLowerCase().normalize('NFKC');
    const rawPassword = String(body.password || '');

    if (!rawLogin || !rawPassword) {
      return NextResponse.json(
        { success: false, message: 'Login va parolni kiriting' },
        { status: 400 }
      );
    }

    const allUsers = [...USERS, ...getCustomUsers()];

    const matchedUser = allUsers.find(
      (u) =>
        u.logins.map((l) => l.toLowerCase().normalize('NFKC')).includes(rawLogin) &&
        u.passwords.includes(rawPassword)
    );

    if (!matchedUser) {
      recordFailedAttempt(ip);
      // Simulate verification latency against timing attacks
      await new Promise((resolve) => setTimeout(resolve, 80));
      return NextResponse.json(
        { success: false, message: "Login yoki parol noto'g'ri" },
        { status: 401 }
      );
    }

    clearFailedAttempts(ip);

    recordPresenceActivity({
      role: matchedUser.role,
      userName: matchedUser.name,
      path: matchedUser.redirectUrl,
      ip,
      userAgent: req.headers.get('user-agent') || '',
      eventType: 'LOGIN',
      details: `${matchedUser.name} tizimga kirdi (${matchedUser.redirectUrl})`,
    });

    const nowSeconds = Math.floor(Date.now() / 1000);
    const tokenPayload = {
      sub: matchedUser.id,
      role: matchedUser.role,
      fullName: matchedUser.name,
      className: matchedUser.className || (matchedUser.role === 'TEACHER' ? '9-A' : undefined),
      iat: nowSeconds,
      exp: nowSeconds + 12 * 60 * 60, // 12 hours
    };

    const accessToken = await createJwt(tokenPayload, JWT_SECRET);
    const refreshToken = crypto.randomBytes(32).toString('hex');
    const csrfToken = crypto.randomBytes(24).toString('hex');

    const response = NextResponse.json({
      success: true,
      role: matchedUser.role,
      redirectUrl: matchedUser.redirectUrl,
      mustChangePassword: false,
      user: {
        id: matchedUser.id,
        fullName: matchedUser.name,
        role: matchedUser.role,
        className: matchedUser.className || (matchedUser.role === 'TEACHER' ? '9-A' : undefined),
      },
    });

    const isProd = process.env.NODE_ENV === 'production';

    // Store secure cookies
    response.cookies.set('neom_access_token', accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      path: '/',
      maxAge: 12 * 60 * 60,
    });

    response.cookies.set('neom_refresh_token', refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    response.cookies.set('neom_csrf_token', csrfToken, {
      httpOnly: false, // Frontend can read for CSRF verification header
      secure: isProd,
      sameSite: 'lax',
      path: '/',
      maxAge: 12 * 60 * 60,
    });

    return response;
  } catch {
    return NextResponse.json(
      { success: false, message: 'Serverga ulanishda xatolik yuz berdi' },
      { status: 500 }
    );
  }
}
