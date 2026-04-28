import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/request';

/**
 * Sellora Storefront Middleware
 * 
 * Handles multi-tenant routing based on subdomains.
 * E.g. chasiv.raaenai.com -> fetches 'chasiv' store data
 */
export async function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const hostname = request.headers.get('host') || '';
  const platformDomain = process.env.NEXT_PUBLIC_PLATFORM_DOMAIN || 'raaenai.com';

  // Extract subdomain (e.g. 'chasiv' from 'chasiv.raaenai.com')
  let subdomain = '';
  if (hostname.endsWith(`.${platformDomain}`)) {
    subdomain = hostname.replace(`.${platformDomain}`, '');
  }

  // Skip middleware for platform root or special paths
  if (!subdomain || subdomain === 'www' || url.pathname.startsWith('/_next') || url.pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  try {
    // Fetch store data from the platform API
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/trpc/stores.getBySlug?batch=1&input=${encodeURIComponent(JSON.stringify({ "0": { "json": { "slug": subdomain } } }))}`);
    
    if (!response.ok) {
      console.error(`Store not found for subdomain: ${subdomain}`);
      return NextResponse.rewrite(new URL('/not-found', request.url));
    }

    const data = await response.json();
    const store = data[0]?.result?.data?.json;

    if (!store) {
      return NextResponse.rewrite(new URL('/not-found', request.url));
    }

    // Pass store data to the page via headers
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-store-data', JSON.stringify(store));

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    console.error('Middleware Error:', error);
    return NextResponse.rewrite(new URL('/not-found', request.url));
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
