import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Allow login page and API routes (for now)
  if (pathname.startsWith('/login') || pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  // 2. Check for admin session cookie
  const session = request.cookies.get('admin_session');
  const adminSecret = process.env.ADMIN_SECRET;

  // If secret is missing in prod, it's a critical error but we shouldn't crash the build/proxy evaluation
  if (!adminSecret) {
    console.warn('⚠️ ADMIN_SECRET is not defined. Access might be restricted.');
  }

  if (!session || session.value !== adminSecret) {
    // Only redirect if we have a secret to check against, or if we're in production
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
