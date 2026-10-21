import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

interface UserAccount {
  id: string;
  logins: string[];
  passwords: string[];
  role: 'DIRECTOR' | 'ZAVUCH' | 'TEACHER';
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
    name: 'Rustamov Shavkat Akbarovich',
    redirectUrl: '/panel/direktor',
  },
  {
    id: 'user-zavuch-002',
    logins: ['admin2', 'zamdrektor', 'zamdirektor', 'zavuch'],
    passwords: [process.env.SEED_ZAVUCH_PASSWORD || 'admin2', 'admin2', 'zamdrektor123'],
    role: 'ZAVUCH',
    name: 'Nodirova Dilnoza Alisherovna',
    redirectUrl: '/panel/zavuch',
  },
  {
    id: 'user-teacher-003',
    logins: ['admin3', "o'qituvchi", 'oqituvchi', 'o‘qituvchi', 'teacher1'],
    passwords: [process.env.SEED_TEACHER_PASSWORD || 'admin3', 'admin3', "o'qituvchi", 'oqituvchi'],
    role: 'TEACHER',
    name: 'Qodirov Jamshid Baxromovich',
    className: '9-A',
    redirectUrl: '/panel/ustoz',
  },
];

const JWT_SECRET =
  process.env.JWT_SECRET ||
  'neom_school_super_secure_jwt_access_token_secret_key_2026_xyz_789';

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
  try {
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
      // Simulate verification latency against timing attacks
      await new Promise((resolve) => setTimeout(resolve, 80));
      return NextResponse.json(
        { success: false, message: "Login yoki parol noto'g'ri" },
        { status: 401 }
      );
    }

    const nowSeconds = Math.floor(Date.now() / 1000);
    const tokenPayload = {
      sub: matchedUser.id,
      role: matchedUser.role,
      fullName: matchedUser.name,
      className: matchedUser.className || (matchedUser.role === 'TEACHER' ? '9-A' : undefined),
      iat: nowSeconds,
      exp: nowSeconds + 12 * 60 * 60, // 12 hours
    };

    const accessToken = createJwt(tokenPayload, JWT_SECRET);
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
