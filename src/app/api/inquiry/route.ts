// src/app/api/inquiry/route.ts — booking inquiries: save to Supabase, notify Ernie, auto-reply with riders attached
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import {
  TECH_RIDER_PDF_BASE64, HOSP_RIDER_PDF_BASE64, TECH_RIDER_FILENAME, HOSP_RIDER_FILENAME,
} from '@/lib/riders';

export const runtime = 'nodejs';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const BOOKING_ADDRESS = 'booking@erniesavage.com';
const BOOKING_FROM = process.env.BOOKING_FROM_EMAIL || 'Ernie Savage Booking <booking@erniesavage.com>';

function esc(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export async function POST(req: Request) {
  let body: any;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'Bad request.' }, { status: 400 }); }

  const s = (v: unknown, max = 500) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
  const name = s(body.name, 120);
  const email = s(body.email, 200).toLowerCase();
  const organization = s(body.organization, 200);
  const format = s(body.format, 80);
  const city = s(body.city, 120);
  const dateWindow = s(body.dateWindow, 120);
  const budget = s(body.budget, 60);
  const message = s(body.message, 4000);
  const source = s(body.source, 120) || 'unknown';

  if (!name) return NextResponse.json({ error: 'Enter your name.' }, { status: 400 });
  if (!EMAIL_RE.test(email)) return NextResponse.json({ error: 'That email address doesn\'t look right.' }, { status: 400 });

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || null;

  const { error } = await supabase.from('inquiries').insert({
    name, email, organization: organization || null, format: format || null, city: city || null,
    date_window: dateWindow || null, budget: budget || null, message: message || null, source, ip,
  });
  if (error) {
    console.error('inquiry: supabase error', error);
    return NextResponse.json({ error: 'Could not send your inquiry. Try again in a moment.' }, { status: 500 });
  }

  if (!process.env.RESEND_API_KEY) return NextResponse.json({ ok: true });
  const resend = new Resend(process.env.RESEND_API_KEY);

  const rows = [
    ['Name', name], ['Email', email], ['Organization / venue', organization], ['Format', format],
    ['City', city], ['Date or window', dateWindow], ['Budget', budget],
  ].filter(([, v]) => v).map(([k, v]) => `<tr><td style="color:#777;padding:4px 12px 4px 0;vertical-align:top">${k}</td><td style="padding:4px 0">${esc(v)}</td></tr>`).join('');

  const tasks: Promise<unknown>[] = [
    // 1) Notify Ernie
    resend.emails.send({
      from: BOOKING_FROM,
      to: BOOKING_ADDRESS,
      reply_to: email,
      subject: `Booking inquiry — ${name}${organization ? ` (${organization})` : ''}${format ? ` · ${format}` : ''}`,
      html: `<div style="font-family:Georgia,serif;font-size:16px;line-height:1.5;color:#222;max-width:600px">
        <p>New Celebrate Nilsson inquiry from ${esc(source)}.</p>
        <table style="border-collapse:collapse;font-size:15px">${rows}</table>
        ${message ? `<p style="white-space:pre-wrap;border-left:3px solid #ddd;padding-left:12px;margin-top:16px">${esc(message)}</p>` : ''}
        <p style="color:#777;font-size:13px">Reply to this email to answer them directly.</p>
      </div>`,
    }).catch((e: unknown) => console.error('inquiry: notify error', e)),

    // 2) Auto-reply to the presenter, riders attached
    resend.emails.send({
      from: BOOKING_FROM,
      to: email,
      subject: 'Celebrate Nilsson — your inquiry',
      html: `<div style="font-family:Georgia,serif;font-size:17px;line-height:1.6;color:#222;max-width:560px">
        <p>Thanks for asking about Celebrate Nilsson. You'll hear back from me personally, usually the same day, with a quote for your date.</p>
        <p>The technical and hospitality riders are attached so you can check your room against them now. The short version: a good piano or a fully weighted 88-key keyboard, a vocal line and a guitar DI, and the performer facing the audience. Everything else is easy.</p>
        <p>Best regards,<br>Ernie Savage</p>
        <p style="font-size:13px;color:#777">Ernie Savage LLC · booking@erniesavage.com · celebratenilsson.com</p>
      </div>`,
      attachments: [
        { filename: TECH_RIDER_FILENAME, content: Buffer.from(TECH_RIDER_PDF_BASE64, 'base64') },
        { filename: HOSP_RIDER_FILENAME, content: Buffer.from(HOSP_RIDER_PDF_BASE64, 'base64') },
      ],
    }).catch((e: unknown) => console.error('inquiry: auto-reply error', e)),
  ];

  await Promise.allSettled(tasks);
  return NextResponse.json({ ok: true });
}
