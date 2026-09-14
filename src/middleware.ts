import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 1) Marks requests arriving on celebratenilsson.com / .org so the layout can show the right header.
// 2) Serves the Celebrate Nilsson landing page at the root of those domains.
// erniesavage.com is untouched.
export function middleware(req: NextRequest) {
  const host = (req.headers.get('host') || '').toLowerCase();
  const isNilssonHost = host.includes('celebratenilsson.');

  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('x-site', isNilssonHost ? 'nilsson' : 'ernie');

  if (isNilssonHost && req.nextUrl.pathname === '/') {
    const url = req.nextUrl.clone();
    url.pathname = '/celebrate-nilsson';
    return NextResponse.rewrite(url, { request: { headers: requestHeaders } });
  }

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  // Run on pages only — skip Next internals, static files, images, and API routes.
  matcher: ['/((?!_next/|api/|images/|favicon|apple-touch-icon|og-image|.*\\..*).*)'],
};
