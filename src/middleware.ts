import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Two sites run from this one codebase. Each address must show ONLY its own pages,
// otherwise Google sees two addresses carrying the same pages and merges them.
//
// celebratenilsson.com / .org shows:
//   /                    the Celebrate Nilsson landing page
//   /booking             the booking page
//   /booking-confirmed   the booking confirmation page
//   /nerfa               the NERFA 2026 Room 169 schedule (until the conference ends)
//   Everything else on that address forwards to the same path on www.erniesavage.com.
//
// www.erniesavage.com shows everything else, and forwards the
// Celebrate Nilsson pages above to celebratenilsson.com.

const NILSSON_ORIGIN = 'https://celebratenilsson.com';
const ERNIE_ORIGIN = 'https://www.erniesavage.com';

// Pages that live only on celebratenilsson.com (besides the home page).
const NILSSON_ONLY_PATHS = ['/booking', '/booking-confirmed', '/nerfa'];

// After the conference, /nerfa sends people to the home page so the printed
// cards and QR codes keep working. 4:00 AM New York time on Nov 16, 2026 = 09:00 UTC.
const NERFA_PAGE_ENDS = Date.parse('2026-11-16T09:00:00Z');

export function middleware(req: NextRequest) {
  const host = (req.headers.get('host') || '').toLowerCase();
  const isNilssonHost = host.includes('celebratenilsson.');

  // Path without a trailing slash, so "/booking/" is treated as "/booking".
  let path = req.nextUrl.pathname;
  if (path.length > 1 && path.endsWith('/')) {
    path = path.slice(0, -1);
  }
  // Keeps anything after a "?" in the address when forwarding.
  const search = req.nextUrl.search;

  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('x-site', isNilssonHost ? 'nilsson' : 'ernie');

  // The NERFA page retires itself once the conference is over (either address).
  if (path === '/nerfa' && Date.now() > NERFA_PAGE_ENDS) {
    return NextResponse.redirect(NILSSON_ORIGIN + '/', 302);
  }

  if (isNilssonHost) {
    // Home page: serve the Celebrate Nilsson landing page.
    if (path === '/') {
      const url = req.nextUrl.clone();
      url.pathname = '/celebrate-nilsson';
      return NextResponse.rewrite(url, { request: { headers: requestHeaders } });
    }

    // The landing page's internal path should not be a second copy of the home page.
    if (path === '/celebrate-nilsson') {
      return NextResponse.redirect(NILSSON_ORIGIN + '/' + search, 301);
    }

    // Celebrate Nilsson's own pages: serve them here.
    if (NILSSON_ONLY_PATHS.includes(path)) {
      return NextResponse.next({ request: { headers: requestHeaders } });
    }

    // Anything else belongs to erniesavage.com: forward it there.
    return NextResponse.redirect(ERNIE_ORIGIN + path + search, 301);
  }

  // From here down: erniesavage.com (and any other address).

  if (path === '/celebrate-nilsson') {
    return NextResponse.redirect(NILSSON_ORIGIN + '/' + search, 301);
  }

  if (NILSSON_ONLY_PATHS.includes(path)) {
    return NextResponse.redirect(NILSSON_ORIGIN + path + search, 301);
  }

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  // Run on pages only — skip Next internals, static files, images, and API routes.
  matcher: ['/((?!_next/|api/|images/|favicon|apple-touch-icon|og-image|.*\\..*).*)'],
};
