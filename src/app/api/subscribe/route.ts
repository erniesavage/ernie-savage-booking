// src/app/api/subscribe/route.ts — writes a signup to Supabase, sends the welcome email (Resend) and the SMS confirmation (Twilio)
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import twilio from 'twilio';

export const runtime = 'nodejs';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeUS(phone: string): string | null {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`;
  return null;
}

export async function POST(req: Request) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Bad request.' }, { status: 400 });
  }

  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : null;
  const mobileRaw = typeof body.mobile === 'string' ? body.mobile : null;
  const emailOptIn = Boolean(body.emailOptIn && email);
  const smsOptIn = Boolean(body.smsOptIn && mobileRaw);
  const source = typeof body.source === 'string' ? body.source.slice(0, 120) : 'unknown';
  const consentText = typeof body.smsConsentText === 'string' ? body.smsConsentText : null;

  if (email && !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'That email address doesn\'t look right.' }, { status: 400 });
  }
  const mobile = smsOptIn && mobileRaw ? normalizeUS(mobileRaw) : null;
  if (smsOptIn && !mobile) {
    return NextResponse.json({ error: 'Enter a 10-digit US mobile number.' }, { status: 400 });
  }
  if (!emailOptIn && !smsOptIn) {
    return NextResponse.json({ error: 'Enter an email address or a mobile number.' }, { status: 400 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || null;

  const row = {
    email: email || null,
    mobile: mobile || null,
    email_opt_in: emailOptIn,
    sms_opt_in: smsOptIn,
    sms_consent_text: smsOptIn ? consentText : null,
    sms_consent_at: smsOptIn ? new Date().toISOString() : null,
    source,
    ip,
  };

  // Upsert on email when present; otherwise on mobile.
  const conflictKey = email ? 'email' : 'mobile';
  const { error } = await supabase.from('subscribers').upsert(row, { onConflict: conflictKey });
  if (error) {
    console.error('subscribe: supabase error', error);
    return NextResponse.json({ error: 'Could not save your signup. Try again in a moment.' }, { status: 500 });
  }

  // Notifications are best-effort: a failure here should not fail the signup.
  const tasks: Promise<unknown>[] = [];

  if (emailOptIn && email && process.env.RESEND_API_KEY && process.env.FROM_EMAIL) {
    const resend = new Resend(process.env.RESEND_API_KEY);
    tasks.push(
      resend.emails
        .send({
          from: process.env.FROM_EMAIL,
          to: email,
          subject: "You're on the Celebrate Nilsson list",
          html: `
            <div style="font-family:Georgia,serif;font-size:17px;line-height:1.6;color:#222;max-width:560px">
              <p>Thanks — you're on the list.</p>
              <p>You'll hear from me first when Celebrate Nilsson dates go on sale in New York, and now and then when there's something worth sharing about Harry.</p>
              <p>Until then, the live highlights are here: <a href="https://celebratenilsson.com">celebratenilsson.com</a></p>
              <p>Best regards,<br>Ernie Savage</p>
              <p style="font-size:13px;color:#777">Ernie Savage LLC · New York City · To stop receiving these emails, reply with "unsubscribe."</p>
            </div>`,
        })
        .catch((e: unknown) => console.error('subscribe: resend error', e))
    );
  }

  if (smsOptIn && mobile && process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER) {
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    tasks.push(
      client.messages
        .create({
          from: process.env.TWILIO_PHONE_NUMBER,
          to: mobile,
          body:
            "Celebrate Nilsson: you're on the list. You'll get a text when New York show dates go on sale. Msg & data rates may apply. Reply STOP to opt out, HELP for help.",
        })
        .catch((e: unknown) => console.error('subscribe: twilio error', e))
    );
  }

  await Promise.allSettled(tasks);
  return NextResponse.json({ ok: true });
}
