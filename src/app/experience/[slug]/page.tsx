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

  // ============================================================
  // BOOKING CTA COMPONENT (reused across sections)
  // ============================================================
  function renderShowCards() {
    return (
      <>
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

            {show.status !== 'sold_out' && selectedShow?.id !== show.id && (
              <button
                className="checkout-btn"
                style={{ marginTop: '16px', width: '100%' }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (paymentStep === 'form') {
                    setSelectedShow(show);
                    setTickets(1);
                  }
                }}
              >
                Purchase Seats
              </button>
            )}

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
                  {(contactPref === 'sms' || contactPref === 'both') && (
                    <p style={{ fontSize: '11px', color: '#5a4d3d', marginTop: '8px', lineHeight: 1.5 }}>
                      By selecting SMS, you consent to receive a one-time booking confirmation text message. Msg &amp; data rates may apply. Reply STOP to opt out, HELP for help. No recurring messages. See our <a href="/privacy" style={{ color: '#8a7d6d', textDecoration: 'underline' }}>Privacy Policy</a> and <a href="/terms" style={{ color: '#8a7d6d', textDecoration: 'underline' }}>Terms</a>.
                    </p>
                  )}
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
      </>
    );
  }

  // ============================================================
  // SECRET BALLADS — CUSTOM LAYOUT
  // ============================================================
  if (slug === 'secret-ballads') {
    return (
      <main>
        {/* 1. HERO */}
        <section
          className="hero"
          style={{
            backgroundImage:
              "linear-gradient(180deg, rgba(13,11,9,0.6) 0%, rgba(13,11,9,0.35) 30%, rgba(13,11,9,0.5) 60%, rgba(13,11,9,0.95) 100%), url('/images/Piano_room_desktop_hero_no_mixer_EX.jpg')",
            minHeight: 'auto',
            padding: '120px 24px',
          }}
        >
          <div className="hero-content">
            <h1>Secret Ballads</h1>
            <p className="hero-main-text" style={{ marginTop: '16px', fontSize: '20px' }}>
              An intimate evening of classic and forgotten songs — performed up close.
            </p>
            <p style={{ marginTop: '28px', color: '#c4a574', fontSize: '20px', letterSpacing: '0.05em', fontFamily: "'Playfair Display', serif" }}>
              $125 per guest &bull; Limited to 10 seats
            </p>
            <div style={{ marginTop: '28px' }}>
              <a href="#reserve" className="card-link" style={{ fontSize: '18px', letterSpacing: '0.06em' }}>Reserve Your Seat &rarr;</a>
            </div>
          </div>
        </section>

        {/* 2. SHORT EXPERIENCE PROMISE */}
        <section style={{ padding: '80px 24px', maxWidth: '700px', margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontSize: '22px', fontStyle: 'italic', color: '#c4a574', lineHeight: 1.6, marginBottom: '32px' }}>
            Some songs don&apos;t shout. They stay with you quietly.
          </p>
          <p className="hero-main-text" style={{ marginBottom: '20px' }}>
            Secret Ballads is an intimate songwriter salon — built around songs that shaped us. Some are well known. Some were quietly overlooked. All of them carry emotional weight.
          </p>
          <p className="hero-main-text">
            This is not a concert hall. It&apos;s a small room. Real people. Real listening.
          </p>
        </section>

        {/* 3. FIRST CTA — AVAILABLE DATES */}
        <section className="shows-section" id="reserve">
          <div className="shows-title">Available Dates</div>
          {renderShowCards()}
        </section>

        {/* 4. VIDEO SECTION */}
        <section style={{ padding: '80px 24px', maxWidth: '700px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '30px', letterSpacing: '0.04em', marginBottom: '32px', color: '#e8dcc8' }}>
            See What an Evening Feels Like
          </h2>
          <div style={{ background: 'rgba(20,17,13,0.6)', border: '1px solid rgba(196,165,116,0.15)', padding: '60px 24px', color: '#5a4d3d', fontSize: '14px' }}>
            Video coming soon
          </div>
        </section>

        {/* 5. WHAT THIS EVENING FEELS LIKE */}
        <section
          className="hero"
          style={{
            backgroundImage:
              "linear-gradient(180deg, rgba(13,11,9,0.85) 0%, rgba(13,11,9,0.55) 30%, rgba(13,11,9,0.55) 70%, rgba(13,11,9,0.9) 100%), url('/images/guitar_room_crop color_no_mixer_EX.jpg')",
            minHeight: 'auto',
            padding: '100px 24px',
          }}
        >
          <div className="hero-content">
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '30px', letterSpacing: '0.04em', marginBottom: '40px', color: '#e8dcc8' }}>
              What This Evening Feels Like
            </h2>
            <p className="hero-main-text">The kind of room where you can hear breath between phrases</p>
            <p className="hero-main-text">Stories behind songs you thought you already knew</p>
            <p className="hero-main-text">Unexpected emotional turns</p>
            <p className="hero-main-text">Silence that feels shared — not empty</p>
          </div>
        </section>

        {/* 6. WHAT YOU'LL EXPERIENCE */}
        <section style={{ padding: '80px 24px', maxWidth: '700px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '30px', letterSpacing: '0.04em', marginBottom: '40px', color: '#e8dcc8' }}>
            What You&apos;ll Experience
          </h2>
          <p className="hero-main-text">75 minutes of live piano/guitar and vocal performance</p>
          <p className="hero-main-text">Personal storytelling woven between songs</p>
          <p className="hero-main-text">An audience of 8&ndash;10 guests</p>
          <p className="hero-main-text">No amplification beyond what the room requires</p>
          <p className="hero-main-text">A rare, human-scale musical gathering</p>
        </section>

        {/* 7. WHO THIS IS FOR */}
        <section style={{ padding: '60px 24px 80px', maxWidth: '700px', margin: '0 auto', textAlign: 'center', borderTop: '1px solid rgba(196,165,116,0.1)' }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '30px', letterSpacing: '0.04em', marginBottom: '40px', color: '#e8dcc8' }}>
            Who This Is For
          </h2>
          <p className="hero-main-text">Listeners who value depth over volume</p>
          <p className="hero-main-text">Couples looking for something meaningful</p>
          <p className="hero-main-text">Music lovers who miss when songs felt personal</p>
        </section>

        {/* 8. LOGISTICS + PRICE */}
        <section style={{ padding: '60px 24px 80px', maxWidth: '700px', margin: '0 auto', textAlign: 'center', borderTop: '1px solid rgba(196,165,116,0.1)' }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '30px', letterSpacing: '0.04em', marginBottom: '40px', color: '#e8dcc8' }}>
            Details
          </h2>
          <p className="hero-main-text">Duration: 90 minutes</p>
          <p className="hero-main-text">Capacity: 10 guests max</p>
          <p className="hero-main-text">Location: Manhattan, NYC studio (address noted with your booking date selection)</p>
          <p className="hero-main-text" style={{ color: '#c4a574' }}>Price: $125 per guest</p>
        </section>

        {/* 9. FINAL CTA */}
        <section
          className="hero"
          style={{
            backgroundImage:
              "linear-gradient(180deg, rgba(13,11,9,0.85) 0%, rgba(13,11,9,0.5) 30%, rgba(13,11,9,0.5) 70%, rgba(13,11,9,0.9) 100%), url('/images/Piano hands warm color_EX.png')",
            minHeight: 'auto',
            padding: '120px 24px',
          }}
        >
          <div className="hero-content">
            <p className="hero-main-text" style={{ fontSize: '22px', fontStyle: 'italic' }}>
              A small room. A real piano. Songs that still matter.
            </p>
            <div style={{ marginTop: '32px' }}>
              <a href="#reserve" className="card-link" style={{ fontSize: '16px' }}>Reserve Your Seat &rarr;</a>
            </div>
          </div>
        </section>
      </main>
    );
  }

  // ============================================================
  // DEFAULT LAYOUT — ALL OTHER EXPERIENCES
  // ============================================================
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
        {renderShowCards()}
      </section>
    </main>
  );
}
