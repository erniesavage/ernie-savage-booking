import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Serve the Celebrate Nilsson landing page at the root of celebratenilsson.com / .org.
// Everything else (assets, API routes, other paths) passes through untouched.
export function middleware(req: NextRequest) {
  const host = (req.headers.get('host') || '').toLowerCase();
  const isNilssonHost = host.includes('celebratenilsson.');

  if (isNilssonHost && req.nextUrl.pathname === '/') {
    const url = req.nextUrl.clone();
    url.pathname = '/celebrate-nilsson';
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/'],
};
