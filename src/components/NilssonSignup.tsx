'use client';
// src/components/NilssonSignup.tsx — email + text signup form for the Celebrate Nilsson list
import { useState } from 'react';

const SMS_CONSENT =
  'I agree to receive text messages from Ernie Savage / Celebrate Nilsson about show dates and ticket on-sales. Message frequency varies (a few per year). Msg & data rates may apply. Reply STOP to opt out, HELP for help.';

export default function NilssonSignup() {
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [emailOptIn, setEmailOptIn] = useState(true);
  const [smsOptIn, setSmsOptIn] = useState(false);
  const [status, setStatus] = useState<'idle' | 'sending' | 'ok' | 'err'>('idle');
  const [message, setMessage] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMessage('');

    const wantsEmail = emailOptIn && email.trim().length > 0;
    const wantsSms = smsOptIn && mobile.trim().length > 0;

    if (!wantsEmail && !wantsSms) {
      setStatus('err');
      setMessage('Enter an email address or a mobile number and check the matching box.');
      return;
    }
    if (mobile.trim() && !smsOptIn) {
      setStatus('err');
      setMessage('Check the text-message box to receive texts at that number.');
      return;
    }

    setStatus('sending');
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: wantsEmail ? email.trim() : null,
          mobile: wantsSms ? mobile.trim() : null,
          emailOptIn: wantsEmail,
          smsOptIn: wantsSms,
          smsConsentText: wantsSms ? SMS_CONSENT : null,
          source: typeof window !== 'undefined' ? window.location.hostname : 'unknown',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Something went wrong.');
      setStatus('ok');
      setMessage(
        wantsSms
          ? "You're on the list. A confirmation text is on its way."
          : "You're on the list. Watch your inbox for show dates."
      );
      setEmail('');
      setMobile('');
    } catch (err: any) {
      setStatus('err');
      setMessage(err?.message || 'Something went wrong. Try again in a moment.');
    }
  }

  return (
    <form className="cn-form" onSubmit={submit} noValidate>
      <div className="cn-field">
        <label htmlFor="cn-email">Email</label>
        <input
          id="cn-email"
          type="email"
          inputMode="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
        />
      </div>
      <label className="cn-check">
        <input type="checkbox" checked={emailOptIn} onChange={(e) => setEmailOptIn(e.target.checked)} />
        <span>Email me show dates and news from Celebrate Nilsson.</span>
      </label>

      <div className="cn-field" style={{ marginTop: 26 }}>
        <label htmlFor="cn-mobile">Mobile number (optional)</label>
        <input
          id="cn-mobile"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          value={mobile}
          onChange={(e) => setMobile(e.target.value)}
          placeholder="(917) 555-0123"
        />
      </div>
      <label className="cn-check">
        <input type="checkbox" checked={smsOptIn} onChange={(e) => setSmsOptIn(e.target.checked)} />
        <span>
          {SMS_CONSENT} See our <a href="https://www.erniesavage.com/sms-consent">SMS terms</a>.
        </span>
      </label>

      <button className="cn-btn" type="submit" disabled={status === 'sending'}>
        {status === 'sending' ? 'Adding you…' : 'Get show dates'}
      </button>

      {message && (
        <p className={`cn-msg ${status === 'ok' ? 'ok' : 'err'}`} role="status">
          {message}
        </p>
      )}
    </form>
  );
}
