// src/app/robots.txt/route.ts — points each domain at its own sitemap
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export function GET(req: NextRequest) {
  const host = (req.headers.get('host') || '').toLowerCase();
  const base = host.includes('celebratenilsson.') ? 'https://celebratenilsson.com' : 'https://www.erniesavage.com';
  const body = `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/\n\nSitemap: ${base}/sitemap.xml\n`;
  return new NextResponse(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=3600' } });
}
