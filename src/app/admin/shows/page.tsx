'use client';

import { useState } from 'react';
import Link from 'next/link';

const EXPERIENCES = [
  { slug: 'secret-ballads', label: 'Secret Ballads' },
  { slug: 'everybody-knows-this-song', label: 'Everybody Knows This Song' },
  { slug: 'heart-of-harry', label: 'Heart of Harry' },
  { slug: 'private-concerts', label: 'Private & In-Home Concerts' },
];

export default function AdminShowsPage() {
  const [experience, setExperience] = useState('secret-ballads');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('20:00');
  const [doorsTime, setDoorsTime] = useState('19:30');
  const [venue, setVenue] = useState("Ernie's Studio");
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Rockland Lake');
  const [state, setState] = useState('NY');
  const [notes, setNotes] = useState('');
  const [priceOverride, setPriceOverride] = useState('');
  const [seats, setSeats] = useState('10');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  async function createShow() {
    if (!date) { setMessage('Please select a date.'); return; }
    setSubmitting(true);
    setMessage('');

    try {
      const res = await fetch('/api/shows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          experienceSlug: experience,
          showDate: date,
          showTime: time,
          doorsTime: doorsTime || null,
          venueName: venue,
          venueAddress: address || null,
          venueCity: city,
          venueState: state,
          venueNotes: notes || null,
          priceCents: priceOverride ? parseInt(priceOverride) * 100 : null,
          availableSeats: parseInt(seats),
        }),
      });
      const data = await res.json();
      if (res.ok) { setMessage('Show created!'); setDate(''); }
      else { setMessage('Error: ' + data.error); }
    } catch { setMessage('Error creating show.'); }
    finally { setSubmitting(false); }
  }

  const inputStyle = { marginBottom: '0' };

  return (
    <main>
      <div style={{ maxWidth: 600, margin: '120px auto', padding: '0 24px 80px' }}>
        <Link href="/admin" style={{ color: '#8a7d6d', fontSize: '13px', letterSpacing: '0.1em' }}>
          ← BACK TO DASHBOARD
        </Link>
        <h1 style={{ fontSize: '24px', margin: '20px 0 30px' }}>Create New Show</h1>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label className="form-label">Experience</label>
            <select className="form-select" value={experience} onChange={e => setExperience(e.target.value)}>
              {EXPERIENCES.map(ex => <option key={ex.slug} value={ex.slug}>{ex.label}</option>)}
            </select>
          </div>

          <div className="form-row">
            <div>
              <label className="form-label">Date *</label>
              <input className="form-input" type="date" value={date} onChange={e => setDate(e.target.value)} />
            </div>
            <div>
              <label className="form-label">Show Time</label>
              <input className="form-input" type="time" value={time} onChange={e => setTime(e.target.value)} />
            </div>
            <div>
              <label className="form-label">Doors</label>
              <input className="form-input" type="time" value={doorsTime} onChange={e => setDoorsTime(e.target.value)} />
            </div>
          </div>

          <div>
            <label className="form-label">Venue Name</label>
            <input className="form-input" value={venue} onChange={e => setVenue(e.target.value)} />
          </div>

          <div>
            <label className="form-label">Address</label>
            <input className="form-input" value={address} onChange={e => setAddress(e.target.value)} placeholder="123 Main St" />
          </div>

          <div className="form-row">
            <div>
              <label className="form-label">City</label>
              <input className="form-input" value={city} onChange={e => setCity(e.target.value)} />
            </div>
            <div>
              <label className="form-label">State</label>
              <input className="form-input" value={state} onChange={e => setState(e.target.value)} />
            </div>
          </div>

          <div>
            <label className="form-label">Arrival Notes</label>
            <input className="form-input" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Parking, buzzer code, etc." />
          </div>

          <div className="form-row">
            <div>
              <label className="form-label">Price Override ($)</label>
              <input className="form-input" type="number" value={priceOverride} onChange={e => setPriceOverride(e.target.value)} placeholder="Leave blank for $110 default" />
            </div>
            <div>
              <label className="form-label">Available Seats</label>
              <input className="form-input" type="number" value={seats} onChange={e => setSeats(e.target.value)} />
            </div>
          </div>

          <button className="checkout-btn" disabled={submitting} onClick={createShow}>
            {submitting ? 'Creating...' : 'Create Show'}
          </button>

          {message && (
            <p style={{ textAlign: 'center', color: message.startsWith('Error') ? '#b87333' : '#7a9a6a', marginTop: '8px' }}>
              {message}
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
