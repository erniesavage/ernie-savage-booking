// src/app/sitemap.xml/route.ts — host-aware sitemap: Nilsson URLs on celebratenilsson.com, main-site URLs elsewhere
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const NILSSON = ['/', '/booking'];
const ERNIE = ['/', '/celebrate-nilsson', '/booking', '/privacy', '/terms', '/sms-consent'];

export function GET(req: NextRequest) {
  const host = (req.headers.get('host') || '').toLowerCase();
  const isNilsson = host.includes('celebratenilsson.');
  const base = isNilsson ? 'https://celebratenilsson.com' : 'https://www.erniesavage.com';
  const paths = isNilsson ? NILSSON : ERNIE;
  const today = new Date().toISOString().slice(0, 10);

  const body =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    paths
      .map(
        (p) =>
          `  <url><loc>${base}${p}</loc><lastmod>${today}</lastmod><changefreq>${p === '/' ? 'weekly' : 'monthly'}</changefreq><priority>${p === '/' ? '1.0' : '0.7'}</priority></url>`
      )
      .join('\n') +
    `\n</urlset>\n`;

  return new NextResponse(body, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600' },
  });
}
