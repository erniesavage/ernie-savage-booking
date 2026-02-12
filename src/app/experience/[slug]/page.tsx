'use client';

import { useEffect, useState, useRef, FormEvent } from 'react';
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
  var params = useParams();
  var slug = params.slug as string;
  var info = experienceData[slug];

  var [experience, setExperience] = useState<Experience | null>(null);
  var [shows, setShows] = useState<Show[]>([]);
  var [selectedShow, setSelectedShow] = useState<Show | null>(null);
  var [loading, setLoading] = useState(true);
  var [submitting, setSubmitting] = useState(false);

  // Form state
  var [name, setName] = useState('');
  var [email, setEmail] = useState('');
  var [phone, setPhone] = useState('');
  var [contactPref, setContactPref] = useState('both');
  var [tickets, setTickets] = useState(1);

  // Payment state
  var [paymentStep, setPaymentStep] = useState<'form' | 'payment' | 'confirmed'>('form');
  var [clientSecret, setClientSecret] = useState('');
  var [cardError, setCardError] = useState('');
  var [processing, setProcessing] = useState(false);

  // Stripe refs
  var stripeRef = useRef<any>(null);
  var cardElementRef = useRef<any>(null);
  var cardMountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!slug) return;
    fetchShows();
  }, [slug]);

  // Load Stripe.js
  useEffect(() => {
    if (typeof window === 'undefined') return;
    // @ts-ignore
    if (window.Stripe) {
      // @ts-ignore
      stripeRef.current = window.Stripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
      return;
    }
    var script = document.createElement('script');
    script.src = 'https://js.stripe.com/v3/';
    script.onload = () => {
      // @ts-ignore
      stripeRef.current = window.Stripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
    };
    document.head.appendChild(script);
  }, []);

  // Mount card element when entering payment step
  useEffect(() => {
    if (paymentStep !== 'payment') return;
    if (!stripeRef.current) return;
    if (!cardMountRef.current) return;

    // Small delay to ensure DOM is ready
    var timer = setTimeout(() => {
      if (!cardMountRef.current) return;
      var elements = stripeRef.current.elements();
      var card = elements.create('card', {
        style: {
          base: {
            color: '#e8dcc8',
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: '16px',
            '::placeholder': { color: '#5a4d3d' },
          },
          invalid: { color: '#d9534f' },
        },
      });
      card.mount(cardMountRef.current);
      cardElementRef.current = card;

      card.on('change', (event: any) => {
        if (event.error) {
          setCardError(event.error.message);
        } else {
          setCardError('');
        }
      });
    }, 100);

    return () => {
      clearTimeout(timer);
      if (cardElementRef.current) {
        cardElementRef.current.unmount();
        cardElementRef.current = null;
      }
    };
  }, [paymentStep]);

  async function fetchShows() {
    try {
      var res = await fetch('/api/shows?experience=' + slug);
      var data = await res.json();
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
    return '$' + (cents / 100).toFixed(0);
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
    var parts = timeStr.split(':');
    var hour = parseInt(parts[0]);
    var min = parts[1];
    var ampm = hour >= 12 ? 'PM' : 'AM';
    var h12 = hour % 12 || 12;
    return h12 + ':' + min + ' ' + ampm;
  }

  async function handleReserve() {
    if (!selectedShow || !name) return;
    setSubmitting(true);
    setCardError('');

    try {
      var res = await fetch('/api/create-payment-intent', {
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

      var data = await res.json();

      if (data.clientSecret) {
        setClientSecret(data.clientSecret);
        setPaymentStep('payment');
      } else {
        setCardError(data.error || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      console.error('Payment intent error:', err);
      setCardError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handlePayment(e: FormEvent) {
    e.preventDefault();
    if (!clientSecret || !stripeRef.current || !cardElementRef.current) return;
    setProcessing(true);
    setCardError('');

    try {
      var result = await stripeRef.current.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElementRef.current,
          billing_details: {
            name: name,
            email: email || undefined,
            phone: phone || undefined,
          },
        },
      });

      if (result.error) {
        setCardError(result.error.message || 'Payment failed. Please try again.');
        setProcessing(false);
        return;
      }

      if (result.paymentIntent && result.paymentIntent.status === 'succeeded') {
        // Update seat count locally
        setShows(shows.map((s) => s.id === selectedShow!.id ? { ...s, available_seats: s.available_seats - tickets } : s));
        setPaymentStep('confirmed');
      } else {
        setCardError('Payment was not completed. Please try again.');
      }
    } catch (err: any) {
      console.error('Payment error:', err);
      setCardError(err.message || 'Payment failed. Please try again.');
    } finally {
      setProcessing(false);
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
          {info.fullDesc.map((p: string, i: number) => (
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
            No dates currently scheduled. Check back soon — new experiences are added regularly.
          </p>
        )}

        {shows.map((show) => (
          <div
            key={show.id}
            className="show-card"
            style={{
              borderColor: selectedShow?.id === show.id ? 'rgba(196, 165, 116, 0.5)' : undefined,
              cursor: show.status === 'sold_out' ? 'default' : 'pointer',
              opacity: show.status === 'sold_out' ? 0.5 : 1,
            }}
            onClick={() => {
              if (show.status !== 'sold_out' && paymentStep === 'form') {
                setSelectedShow(selectedShow?.id === show.id ? null : show);
                setTickets(1);
              }
            }}
          >
            <div className="show-date">{formatDate(show.show_date)}</div>
            <div className="show-details">
              {formatTime(show.show_time)}
              {show.doors_time && (' \u00B7 Doors ' + formatTime(show.doors_time))}
            </div>
            <div className="show-details">
              {show.venue_name}
              {show.venue_address && (' \u00B7 ' + show.venue_address)}
            </div>
            <div className="show-price">
              {formatPrice(getPrice(show))} per person
            </div>
            <div className={'show-seats' + (show.available_seats <= 3 ? ' low' : '')}>
              {show.status === 'sold_out' ? 'Sold Out' : show.available_seats + ' seats remaining'}
            </div>

            {/* BOOKING FORM */}
            {selectedShow?.id === show.id && show.status !== 'sold_out' && paymentStep === 'form' && (
              <div className="booking-form" onClick={(e) => e.stopPropagation()}>
                <div className="divider" style={{ margin: '12px 0' }}>
                  <span className="divider-line" />
                  <span style={{ fontSize: '11px', color: '#5a4d3d' }}>BOOK YOUR SPOT</span>
                  <span className="divider-line" />
                </div>

                <div>
                  <label className="form-label">Your Name *</label>
                  <input className="form-input" type="text" placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} />
                </div>

                <div className="form-row">
                  <div>
                    <label className="form-label">Email</label>
                    <input className="form-input" type="email" placeholder="you@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                  </div>
                  <div>
                    <label className="form-label">Phone</label>
                    <input className="form-input" type="tel" placeholder="(555) 555-5555" value={phone} onChange={(e) => setPhone(e.target.value)} />
                  </div>
                </div>

                <div>
                  <label className="form-label">Send confirmation via</label>
                  <div className="contact-options">
                    {['email', 'sms', 'both'].map((opt) => (
                      <div key={opt} className={'contact-option' + (contactPref === opt ? ' active' : '')} onClick={() => setContactPref(opt)}>
                        {opt === 'both' ? 'Email & SMS' : opt.toUpperCase()}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="form-label">Tickets</label>
                  <div className="ticket-selector">
                    <button className="ticket-btn" onClick={() => setTickets(Math.max(1, tickets - 1))}>&#8722;</button>
                    <span className="ticket-count">{tickets}</span>
                    <button className="ticket-btn" onClick={() => setTickets(Math.min(show.available_seats, tickets + 1))}>+</button>
                    <span style={{ color: '#5a4d3d', fontSize: '14px' }}>
                      &times; {formatPrice(getPrice(show))} ={' '}
                      <span style={{ color: '#c4a574' }}>{formatPrice(getPrice(show) * tickets)}</span>
                    </span>
                  </div>
                </div>

                {cardError && <p style={{ color: '#d9534f', fontSize: '14px', margin: '8px 0' }}>{cardError}</p>}

                <button className="checkout-btn" disabled={!name || submitting} onClick={handleReserve}>
                  {submitting ? (
                    <><span className="spinner" />Processing...</>
                  ) : (
                    'Continue to Payment \u2014 ' + formatPrice(getPrice(show) * tickets)
                  )}
                </button>
              </div>
            )}

            {/* PAYMENT FORM */}
            {selectedShow?.id === show.id && paymentStep === 'payment' && (
              <div className="booking-form" onClick={(e) => e.stopPropagation()}>
                <div className="divider" style={{ margin: '12px 0' }}>
                  <span className="divider-line" />
                  <span style={{ fontSize: '11px', color: '#5a4d3d' }}>PAYMENT</span>
                  <span className="divider-line" />
                </div>

                <div style={{ padding: '16px', background: 'rgba(196,165,116,0.05)', border: '1px solid rgba(196,165,116,0.15)', marginBottom: '16px' }}>
                  <div style={{ fontSize: '14px', color: '#e8dcc8' }}>{name}</div>
                  <div style={{ fontSize: '13px', color: '#8a7d6d' }}>{tickets} ticket{tickets > 1 ? 's' : ''} &middot; {formatPrice(getPrice(show) * tickets)}</div>
                </div>

                <form onSubmit={handlePayment}>
                  <div>
                    <label className="form-label">Card Details</label>
                    <div
                      ref={cardMountRef}
                      style={{
                        padding: '14px 16px',
                        background: 'rgba(20,17,13,0.8)',
                        border: '1px solid rgba(196,165,116,0.15)',
                        borderRadius: '0',
                        minHeight: '44px',
                      }}
                    />
                  </div>

                  {cardError && <p style={{ color: '#d9534f', fontSize: '14px', margin: '8px 0' }}>{cardError}</p>}

                  <button className="checkout-btn" type="submit" disabled={processing} style={{ marginTop: '16px' }}>
                    {processing ? (
                      <><span className="spinner" />Processing Payment...</>
                    ) : (
                      'Pay ' + formatPrice(getPrice(show) * tickets)
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => { setPaymentStep('form'); setCardError(''); }}
                    style={{ background: 'none', border: 'none', color: '#8a7d6d', fontSize: '13px', cursor: 'pointer', marginTop: '12px', width: '100%', textAlign: 'center' }}
                  >
                    &larr; Back to details
                  </button>
                </form>
              </div>
            )}

            {/* CONFIRMATION */}
            {selectedShow?.id === show.id && paymentStep === 'confirmed' && (
              <div className="booking-form" onClick={(e) => e.stopPropagation()}>
                <div style={{ textAlign: 'center', padding: '24px 0' }}>
                  <div style={{ fontSize: '36px', marginBottom: '12px' }}>&#9834;</div>
                  <h3 style={{ fontSize: '22px', color: '#e8dcc8', marginBottom: '8px' }}>You&apos;re In.</h3>
                  <p style={{ color: '#8a7d6d', fontSize: '14px', marginBottom: '20px' }}>{name}, your spot is confirmed.</p>
                  <div style={{ padding: '16px', background: 'rgba(196,165,116,0.05)', border: '1px solid rgba(196,165,116,0.15)', textAlign: 'center' }}>
                    <div style={{ color: '#c4a574', fontWeight: 600 }}>{info.title}</div>
                    <div style={{ color: '#e8dcc8', fontSize: '14px', marginTop: '4px' }}>{formatDate(show.show_date)}</div>
                    <div style={{ color: '#8a7d6d', fontSize: '14px' }}>{formatTime(show.show_time)} &middot; {show.venue_name}</div>
                    <div style={{ color: '#8a7d6d', fontSize: '14px' }}>{tickets} ticket{tickets > 1 ? 's' : ''}</div>
                  </div>
                  {show.venue_notes && (
                    <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(35,30,24,0.5)', fontSize: '13px', color: '#c4a574' }}>
                      <strong>Arrival:</strong> {show.venue_notes}
                    </div>
                  )}
                  <p style={{ color: '#8a7d6d', fontSize: '13px', marginTop: '16px' }}>
                    A confirmation has been sent to your email and/or phone. See you there.
                  </p>
                </div>
              </div>
            )}
          </div>
        ))}
      </section>
    </main>
  );
}
