'use client';
// src/components/BookingForm.tsx — inquiry form for celebratenilsson.com/booking
import { useState } from 'react';

const FORMATS = [
  'Listening room or theater',
  'House concert or private event',
  'Corporate or special event',
  'Other',
];
const BUDGETS = ['Under $1,000', '$1,000–2,500', '$2,500–5,000', "Let's discuss"];

export default function BookingForm() {
  const [f, setF] = useState({ name: '', email: '', organization: '', format: '', city: '', dateWindow: '', budget: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'sending' | 'ok' | 'err'>('idle');
  const [msg, setMsg] = useState('');
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setF({ ...f, [k]: e.target.value });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg('');
    if (!f.name.trim()) return fail('Enter your name.');
    if (!f.email.trim()) return fail('Enter an email address so we can reply.');
    setStatus('sending');
    try {
      const res = await fetch('/api/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...f, source: typeof window !== 'undefined' ? window.location.hostname : 'unknown' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Something went wrong.');
      setStatus('ok');
      setMsg("Sent. You'll hear back soon — and the riders are on their way to your inbox now.");
    } catch (err: any) {
      fail(err?.message || 'Something went wrong. Try again in a moment.');
    }
  }
  function fail(m: string) { setStatus('err'); setMsg(m); }

  if (status === 'ok') return <p className="cn-msg ok" role="status">{msg}</p>;

  return (
    <form className="cn-form" onSubmit={submit} noValidate>
      <div className="cn-field"><label htmlFor="bk-name">Name</label>
        <input id="bk-name" type="text" autoComplete="name" value={f.name} onChange={set('name')} /></div>
      <div className="cn-field"><label htmlFor="bk-email">Email</label>
        <input id="bk-email" type="email" inputMode="email" autoComplete="email" value={f.email} onChange={set('email')} /></div>
      <div className="cn-field"><label htmlFor="bk-org">Organization or venue</label>
        <input id="bk-org" type="text" autoComplete="organization" value={f.organization} onChange={set('organization')} /></div>
      <div className="cn-field"><label htmlFor="bk-format">Format</label>
        <select id="bk-format" value={f.format} onChange={set('format')}>
          <option value="">Choose one</option>
          {FORMATS.map((o) => <option key={o} value={o}>{o}</option>)}
        </select></div>
      <div className="cn-field"><label htmlFor="bk-city">City</label>
        <input id="bk-city" type="text" value={f.city} onChange={set('city')} /></div>
      <div className="cn-field"><label htmlFor="bk-date">Date or date window</label>
        <input id="bk-date" type="text" placeholder="e.g. a Saturday in March, or April 10" value={f.dateWindow} onChange={set('dateWindow')} /></div>
      <div className="cn-field"><label htmlFor="bk-budget">Budget range (optional)</label>
        <select id="bk-budget" value={f.budget} onChange={set('budget')}>
          <option value="">Prefer not to say yet</option>
          {BUDGETS.map((o) => <option key={o} value={o}>{o}</option>)}
        </select></div>
      <div className="cn-field"><label htmlFor="bk-msg">Message</label>
        <textarea id="bk-msg" rows={5} value={f.message} onChange={set('message')} placeholder="Tell us about the room, the occasion, or anything else." /></div>
      <button className="cn-btn" type="submit" disabled={status === 'sending'}>
        {status === 'sending' ? 'Sending…' : 'Send inquiry'}
      </button>
      {msg && <p className={`cn-msg ${status === 'err' ? 'err' : 'ok'}`} role="status">{msg}</p>}
    </form>
  );
}
