import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyJwt } from '@/lib/jwt';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect all /panel and /panel/* routes
  if (pathname === '/panel' || pathname.startsWith('/panel/')) {
    const isSuperAdminPanel = pathname.startsWith('/panel/super-admin');
    const isStandardPanel =
      pathname.startsWith('/panel/direktor') ||
      pathname.startsWith('/panel/zavuch') ||
      pathname.startsWith('/panel/ustoz');

    // Only allow known panel routes; anything else is rewritten to 404
    if (!isStandardPanel && !isSuperAdminPanel) {
      return NextResponse.rewrite(new URL('/not-found', request.url), {
        status: 404,
      });
    }

    const accessToken = request.cookies.get('neom_access_token')?.value;

    if (!accessToken) {
      // 404 rewrite: appears completely non-existent to unauthenticated visitors
      return NextResponse.rewrite(new URL('/not-found', request.url), {
        status: 404,
      });
    }

    const payload = await verifyJwt(accessToken);
    if (!payload || !payload.sub || !payload.role) {
      // Invalid, forged or expired token -> 404 rewrite
      return NextResponse.rewrite(new URL('/not-found', request.url), {
        status: 404,
      });
    }

    // STRICT SECRECY: Only SUPER_ADMIN can access /panel/super-admin
    // For anyone else (Director, Zavuch, Ustoz, or unauthorized), it completely looks like 404 Not Found
    if (isSuperAdminPanel && payload.role !== 'SUPER_ADMIN') {
      return NextResponse.rewrite(new URL('/not-found', request.url), {
        status: 404,
      });
    }

    // Role-based segregation for standard panels:
    // Super Admin can inspect all panels; otherwise each role is strictly restricted to its own panel
    if (payload.role !== 'SUPER_ADMIN') {
      if (pathname.startsWith('/panel/ustoz') && payload.role !== 'TEACHER') {
        return NextResponse.rewrite(new URL('/not-found', request.url), {
          status: 404,
        });
      }

      if (pathname.startsWith('/panel/zavuch') && payload.role !== 'ZAVUCH') {
        return NextResponse.rewrite(new URL('/not-found', request.url), {
          status: 404,
        });
      }

      if (pathname.startsWith('/panel/direktor') && payload.role !== 'DIRECTOR') {
        return NextResponse.rewrite(new URL('/not-found', request.url), {
          status: 404,
        });
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/panel', '/panel/:path*'],
};
