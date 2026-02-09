'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { experienceData } from '@/lib/experiences';

interface Show {
  id: string;
  show_date: string;
  show_time: string;
  doors_time: string | null;
  venue_name: string;
  venue_address: string | null;
  venue_city: string;
  venue_state: string;
  venue_notes: string | null;
  price_cents: number | null;
  available_seats: number;
  status: string;
}

interface Experience {
  id: string;
  price_cents: number;
}

export default function ExperiencePage() {
  const params = useParams();
  const slug = params.slug as string;
  const info = experienceData[slug];

  const [experience, setExperience] = useState<Experience | null>(null);
  const [shows, setShows] = useState<Show[]>([]);
  const [selectedShow, setSelectedShow] = useState<Show | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [contactPref, setContactPref] = useState('both');
  const [tickets, setTickets] = useState(1);

  useEffect(() => {
    if (!slug) return;
    fetchShows();
  }, [slug]);

  async function fetchShows() {
    try {
      const res = await fetch(`/api/shows?slug=${slug}`);
      const data = await res.json();
      if (data.experience) setExperience(data.experience);
      if (data.shows) setShows(data.shows);
    } catch (err) {
      console.error('Error fetching shows:', err);
    } finally {
      setLoading(false);
    }
  }

  function getPrice(show: Show) {
    return show.price_cents || experience?.price_cents || 11000;
  }

  function formatPrice(cents: number) {
    return `$${(cents / 100).toFixed(0)}`;
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  }

  function formatTime(timeStr: string) {
    const [h, m] = timeStr.split(':');
    const hour = parseInt(h);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const h12 = hour % 12 || 12;
    return `${h12}:${m} ${ampm}`;
  }

  async function handleCheckout() {
    if (!selectedShow || !name) return;
    setSubmitting(true);

    try {
      const res = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          showId: selectedShow.id,
          experienceSlug: slug,
          customerName: name,
          customerEmail: email || undefined,
          customerPhone: phone || undefined,
          contactPreference: contactPref,
          ticketCount: tickets,
          priceCents: getPrice(selectedShow),
        }),
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert('Something went wrong. Please try again.');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      alert('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (!info) {
    return (
      <main>
        <div className="exp-hero">
          <h1>Experience Not Found</h1>
          <p className="exp-desc">This experience doesn&apos;t exist.</p>
        </div>
      </main>
    );
  }

  return (
    <main>
      {/* EXPERIENCE HERO */}
      <section className="exp-hero">
        <h1>{info.title}</h1>
        <p className="exp-subtitle">{info.subtitle}</p>
        <img src={info.image} alt={info.title} className="exp-image" />
        <div className="exp-desc">
          {info.fullDesc.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </section>

      {/* AVAILABLE SHOWS */}
      <section className="shows-section">
        <div className="shows-title">Available Dates</div>

        {loading && <p className="no-shows-msg">Loading dates...</p>}

        {!loading && shows.length === 0 && (
          <p className="no-shows-msg">
            No dates currently scheduled. Check back soon — new experiences are added
            regularly.
          </p>
        )}

        {shows.map((show) => (
          <div
            key={show.id}
            className="show-card"
            style={{
              borderColor:
                selectedShow?.id === show.id
                  ? 'rgba(196, 165, 116, 0.5)'
                  : undefined,
              cursor: show.status === 'sold_out' ? 'default' : 'pointer',
              opacity: show.status === 'sold_out' ? 0.5 : 1,
            }}
            onClick={() => {
              if (show.status !== 'sold_out') {
                setSelectedShow(selectedShow?.id === show.id ? null : show);
                setTickets(1);
              }
            }}
          >
            <div className="show-date">{formatDate(show.show_date)}</div>
            <div className="show-details">
              {formatTime(show.show_time)}
              {show.doors_time && ` · Doors ${formatTime(show.doors_time)}`}
            </div>
            <div className="show-details">
              {show.venue_name}
              {show.venue_address && ` · ${show.venue_address}`}
            </div>
            <div className="show-price">
              {formatPrice(getPrice(show))} per person
            </div>
            <div
              className={`show-seats ${show.available_seats <= 3 ? 'low' : ''}`}
            >
              {show.status === 'sold_out'
                ? 'Sold Out'
                : `${show.available_seats} seats remaining`}
            </div>

            {/* BOOKING FORM — appears under selected show */}
            {selectedShow?.id === show.id && show.status !== 'sold_out' && (
              <div
                className="booking-form"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="divider" style={{ margin: '12px 0' }}>
                  <span className="divider-line" />
                  <span style={{ fontSize: '11px', color: '#5a4d3d' }}>
                    BOOK YOUR SPOT
                  </span>
                  <span className="divider-line" />
                </div>

                <div>
                  <label className="form-label">Your Name *</label>
                  <input
                    className="form-input"
                    type="text"
                    placeholder="Full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className="form-row">
                  <div>
                    <label className="form-label">Email</label>
                    <input
                      className="form-input"
                      type="email"
                      placeholder="you@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="form-label">Phone</label>
                    <input
                      className="form-input"
                      type="tel"
                      placeholder="(555) 555-5555"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="form-label">Send confirmation via</label>
                  <div className="contact-options">
                    {['email', 'sms', 'both'].map((opt) => (
                      <div
                        key={opt}
                        className={`contact-option ${contactPref === opt ? 'active' : ''}`}
                        onClick={() => setContactPref(opt)}
                      >
                        {opt === 'both' ? 'Email & SMS' : opt.toUpperCase()}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="form-label">Tickets</label>
                  <div className="ticket-selector">
                    <button
                      className="ticket-btn"
                      onClick={() => setTickets(Math.max(1, tickets - 1))}
                    >
                      −
                    </button>
                    <span className="ticket-count">{tickets}</span>
                    <button
                      className="ticket-btn"
                      onClick={() =>
                        setTickets(
                          Math.min(show.available_seats, tickets + 1)
                        )
                      }
                    >
                      +
                    </button>
                    <span style={{ color: '#5a4d3d', fontSize: '14px' }}>
                      × {formatPrice(getPrice(show))} ={' '}
                      <span style={{ color: '#c4a574' }}>
                        {formatPrice(getPrice(show) * tickets)}
                      </span>
                    </span>
                  </div>
                </div>

                <button
                  className="checkout-btn"
                  disabled={!name || submitting}
                  onClick={handleCheckout}
                >
                  {submitting ? (
                    <>
                      <span className="spinner" />
                      Processing...
                    </>
                  ) : (
                    `Reserve ${tickets} ${tickets === 1 ? 'Seat' : 'Seats'} — ${formatPrice(getPrice(show) * tickets)}`
                  )}
                </button>
              </div>
            )}
          </div>
        ))}
      </section>
    </main>
  );
}
