import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Allow login page and API routes
  if (pathname.startsWith('/login') || pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  // 2. Check for admin session cookie
  const session = request.cookies.get('admin_session');
  const adminSecret = process.env.ADMIN_SECRET;

  if (!adminSecret) {
    console.warn('⚠️ ADMIN_SECRET is not defined. Access might be restricted.');
  }

  if (!session || session.value !== adminSecret) {
    if (adminSecret || process.env.NODE_ENV === 'production') {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

// Config to match all routes except static files
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
