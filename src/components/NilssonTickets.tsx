'use client';
// src/components/NilssonTickets.tsx — show dates + inline checkout for Celebrate Nilsson
import { useEffect, useState } from 'react';

const SLUG = 'celebrate-nilsson';

// The January date stays here as a teaser until it goes on sale (status 'scheduled' in Supabase).
// Once the row is scheduled it shows up from the API and this teaser hides itself.
const TEASER = {
  date: '2027-01-15',
  label: 'Friday, January 15, 2027 · 7 PM',
  sub: 'Michiko Studios · On sale December 7 · The 33rd anniversary night',
};

type Show = {
  id: string;
  show_date: string;
  show_time: string;
  doors_time?: string;
  venue_name: string;
  venue_address?: string;
  price_cents: number;
  available_seats: number;
  status: string;
};

function fmtTime(t: string) {
  // Accepts "19:00:00", "19:00", or already-formatted "7:00 PM"
  const m = /^(\d{1,2}):(\d{2})/.exec(t || '');
  if (!m) return t;
  let h = parseInt(m[1], 10);
  const min = m[2];
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return min === '00' ? `${h} ${ampm}` : `${h}:${min} ${ampm}`;
}

function fmtDate(d: string) {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function NilssonTickets() {
  const [shows, setShows] = useState<Show[] | null>(null);
  const [open, setOpen] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/shows?experience=${SLUG}`)
      .then((r) => r.json())
      .then((d) => setShows(d.shows || []))
      .catch(() => setShows([]));
  }, []);

  const hasTeaserDate = (shows || []).some((s) => s.show_date === TEASER.date);

  return (
    <div className="cn-dates">
      {shows === null && <p className="cn-dates-note">Loading dates…</p>}

      {shows && shows.length === 0 && !hasTeaserDate && (
        <p className="cn-dates-note">New York dates are coming. Sign up below to hear first.</p>
      )}

      {shows &&
        shows.map((s) => {
          const soldOut = s.status === 'sold_out' || s.available_seats <= 0;
          const few = !soldOut && s.available_seats <= 6;
          return (
            <div key={s.id} className="cn-date">
              <div className="cn-date-row">
                <div>
                  <div className="cn-date-title">
                    {fmtDate(s.show_date)} · {fmtTime(s.show_time)}
                  </div>
                  <div className="cn-date-sub">
                    {s.venue_name}, Midtown NYC · 24-seat room · ${(s.price_cents / 100).toFixed(0)}
                    {soldOut ? ' · Sold out' : few ? ` · ${s.available_seats} seats left` : ''}
                  </div>
                </div>
                {!soldOut && (
                  <button
                    className="cn-btn cn-btn-inline"
                    onClick={() => setOpen(open === s.id ? null : s.id)}
                    aria-expanded={open === s.id}
                  >
                    {open === s.id ? 'Close' : 'Buy tickets'}
                  </button>
                )}
              </div>
              {open === s.id && <Checkout show={s} />}
            </div>
          );
        })}

      {shows && !hasTeaserDate && (
        <div className="cn-date">
          <div className="cn-date-row">
            <div>
              <div className="cn-date-title">{TEASER.label}</div>
              <div className="cn-date-sub">{TEASER.sub}</div>
            </div>
            <a className="cn-btn cn-btn-inline cn-btn-ghost" href="#signup">
              Get first access
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

function Checkout({ show }: { show: Show }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [pref, setPref] = useState<'email' | 'sms' | 'both'>('email');
  const [qty, setQty] = useState(2);
  const [status, setStatus] = useState<'idle' | 'sending' | 'err'>('idle');
  const [message, setMessage] = useState('');

  const max = Math.min(6, show.available_seats);
  const total = (show.price_cents * qty) / 100;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMessage('');
    if (!name.trim()) return fail('Enter your name.');
    if (!email.trim()) return fail('Enter an email address for your ticket.');
    if ((pref === 'sms' || pref === 'both') && phone.replace(/\D/g, '').length < 10)
      return fail('Enter a 10-digit mobile number for text confirmation.');

    setStatus('sending');
    try {
      const res = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          showId: show.id,
          experienceSlug: SLUG,
          customerName: name.trim(),
          customerEmail: email.trim(),
          customerPhone: phone.trim() || undefined,
          contactPreference: pref,
          ticketCount: qty,
          priceCents: show.price_cents,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error || 'Could not start checkout.');
      window.location.href = data.url;
    } catch (err: any) {
      fail(err.message || 'Could not start checkout. Try again in a moment.');
    }
  }

  function fail(msg: string) {
    setStatus('err');
    setMessage(msg);
  }

  return (
    <form className="cn-checkout" onSubmit={submit} noValidate>
      <div className="cn-field">
        <label htmlFor={`nm-${show.id}`}>Name</label>
        <input id={`nm-${show.id}`} type="text" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div className="cn-field">
        <label htmlFor={`em-${show.id}`}>Email</label>
        <input id={`em-${show.id}`} type="email" inputMode="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div className="cn-field">
        <label htmlFor={`ph-${show.id}`}>Mobile (for a text confirmation, optional)</label>
        <input id={`ph-${show.id}`} type="tel" inputMode="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(917) 555-0123" />
      </div>
      <div className="cn-field">
        <label>Send my ticket by</label>
        <div className="cn-radios">
          <label><input type="radio" name={`pref-${show.id}`} checked={pref === 'email'} onChange={() => setPref('email')} /> Email</label>
          <label><input type="radio" name={`pref-${show.id}`} checked={pref === 'sms'} onChange={() => setPref('sms')} /> Text</label>
          <label><input type="radio" name={`pref-${show.id}`} checked={pref === 'both'} onChange={() => setPref('both')} /> Both</label>
        </div>
        {(pref === 'sms' || pref === 'both') && (
          <p className="cn-fine">One-time text confirmation from Ernie Savage. Msg &amp; data rates may apply. Reply STOP to opt out, HELP for help.</p>
        )}
      </div>
      <div className="cn-field">
        <label htmlFor={`qt-${show.id}`}>Tickets</label>
        <select id={`qt-${show.id}`} value={qty} onChange={(e) => setQty(parseInt(e.target.value))}>
          {Array.from({ length: max }, (_, i) => i + 1).map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
      </div>
      <button className="cn-btn" type="submit" disabled={status === 'sending'}>
        {status === 'sending' ? 'Opening checkout…' : `Continue to payment · $${total.toFixed(0)}`}
      </button>
      {message && <p className="cn-msg err" role="status">{message}</p>}
      <p className="cn-fine">Secure payment by Stripe. Your ticket code arrives by email or text right after.</p>
    </form>
  );
}
