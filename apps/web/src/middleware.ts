import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function parseJwtPayload(token: string) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const json = atob(base64);
    const payload = JSON.parse(json);

    // Check expiration
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect all /panel/* routes
  if (pathname.startsWith('/panel')) {
    const accessToken = request.cookies.get('neom_access_token')?.value;

    if (!accessToken) {
      // 404 rewrite: appears completely non-existent to unauthenticated requests
      return NextResponse.rewrite(new URL('/not-found', request.url), {
        status: 404,
      });
    }

    const payload = parseJwtPayload(accessToken);
    if (!payload || !payload.sub || !payload.role) {
      // Invalid or expired token -> 404 rewrite
      return NextResponse.rewrite(new URL('/not-found', request.url), {
        status: 404,
      });
    }

    // Role-based segregation: each role can ONLY access their own panel
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

  return NextResponse.next();
}

export const config = {
  matcher: ['/panel/:path*'],
};
