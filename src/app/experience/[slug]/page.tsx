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

  var [name, setName] = useState('');
  var [email, setEmail] = useState('');
  var [phone, setPhone] = useState('');
  var [contactPref, setContactPref] = useState('both');
  var [tickets, setTickets] = useState(1);

  var [paymentStep, setPaymentStep] = useState<'form' | 'payment' | 'confirmed'>('form');
  var [clientSecret, setClientSecret] = useState('');
  var [cardError, setCardError] = useState('');
  var [processing, setProcessing] = useState(false);

  var stripeRef = useRef<any>(null);
  var cardElementRef = useRef<any>(null);
  var cardMountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!slug) return;
    fetchShows();
  }, [slug]);

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

  useEffect(() => {
    if (paymentStep !== 'payment') return;
    if (!stripeRef.current) return;
    if (!cardMountRef.current) return;

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
        if (event.error) setCardError(event.error.message);
        else setCardError('');
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
  // BOOKING CARDS (reused)
  // ============================================================
  function renderShowCards() {
    return (
      <>
        {loading && <p className="no-shows-msg">Loading dates...</p>}
        {!loading && shows.length === 0 && (
          <p className="no-shows-msg">No dates currently scheduled. Check back soon — new experiences are added regularly.</p>
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
            <div className="show-price">{formatPrice(getPrice(show))} per person</div>
            <div className={'show-seats' + (show.available_seats <= 3 ? ' low' : '')}>
              {show.status === 'sold_out' ? 'Sold Out' : show.available_seats + ' seats remaining'}
            </div>

            {show.status !== 'sold_out' && selectedShow?.id !== show.id && (
              <button className="checkout-btn" style={{ marginTop: '16px', width: '100%' }} onClick={(e) => { e.stopPropagation(); if (paymentStep === 'form') { setSelectedShow(show); setTickets(1); } }}>
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
                  {submitting ? (<><span className="spinner" />Processing...</>) : ('Continue to Payment \u2014 ' + formatPrice(getPrice(show) * tickets))}
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
                    <div ref={cardMountRef} style={{ padding: '14px 16px', background: 'rgba(20,17,13,0.8)', border: '1px solid rgba(196,165,116,0.15)', borderRadius: '0', minHeight: '44px' }} />
                  </div>
                  {cardError && <p style={{ color: '#d9534f', fontSize: '14px', margin: '8px 0' }}>{cardError}</p>}
                  <button className="checkout-btn" type="submit" disabled={processing} style={{ marginTop: '16px' }}>
                    {processing ? (<><span className="spinner" />Processing Payment...</>) : ('Pay ' + formatPrice(getPrice(show) * tickets))}
                  </button>
                  <button type="button" onClick={() => { setPaymentStep('form'); setCardError(''); }} style={{ background: 'none', border: 'none', color: '#8a7d6d', fontSize: '13px', cursor: 'pointer', marginTop: '12px', width: '100%', textAlign: 'center' }}>
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
            backgroundImage: "linear-gradient(180deg, rgba(13,11,9,0.5) 0%, rgba(13,11,9,0.3) 30%, rgba(13,11,9,0.5) 60%, rgba(13,11,9,0.95) 100%), url('/images/behind ernie.jpeg')",
            minHeight: 'auto',
            padding: '140px 24px 80px',
          }}
        >
          <div className="hero-content">
            <h1 style={{ fontSize: '48px', marginBottom: '16px' }}>Secret Ballads</h1>
            <p className="hero-main-text" style={{ fontSize: '20px', maxWidth: '600px' }}>
              An intimate live piano concert of classic and forgotten songs — performed in a private Manhattan studio.
            </p>
            <p style={{ marginTop: '24px', color: '#e8dcc8', fontSize: '18px', fontStyle: 'italic', textAlign: 'center' }}>
              With singer-songwriter Ernie Savage
            </p>
            <p style={{ marginTop: '10px', color: '#b8a88a', fontSize: '16px', maxWidth: '550px', lineHeight: 1.7, textAlign: 'center', margin: '10px auto 0' }}>
              Award-winning songwriter and NYC-based live performer known for intimate, salon-style musical evenings.
            </p>
            <div style={{ marginTop: '32px', display: 'flex', gap: '24px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <span style={{ color: '#c4a574', fontSize: '14px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>90-minute live performance</span>
              <span style={{ color: '#5a4d3d' }}>&bull;</span>
              <span style={{ color: '#c4a574', fontSize: '14px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Limited to 10 guests</span>
              <span style={{ color: '#5a4d3d' }}>&bull;</span>
              <span style={{ color: '#c4a574', fontSize: '14px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>$125 per person</span>
            </div>
            <div style={{ marginTop: '28px', display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <a href="#reserve" className="checkout-btn" style={{ display: 'inline-block', padding: '12px 28px', fontSize: '15px', textDecoration: 'none' }}>Reserve Your Seat</a>
            </div>
          </div>
        </section>

        {/* PURCHASE BOX — JUST BELOW HERO */}
        <section className="shows-section" id="reserve">
          <div className="shows-title">Available Dates</div>
          {renderShowCards()}
        </section>

        {/* 2. VIDEO SECTION */}
        <section style={{ padding: '20px 24px 80px', textAlign: 'center', background: '#0d0b09' }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '30px', letterSpacing: '0.04em', marginBottom: '32px', color: '#e8dcc8' }}>
            See What Secret Ballads Feels Like
          </h2>
          <div style={{ maxWidth: '700px', margin: '0 auto', background: 'rgba(20,17,13,0.6)', border: '1px solid rgba(196,165,116,0.15)', padding: '60px 24px', color: '#5a4d3d', fontSize: '14px' }}>
            Video coming soon
          </div>
          <p className="hero-main-text" style={{ marginTop: '24px', fontStyle: 'italic' }}>
            An intimate room. A grand piano or guitar. Songs that still live inside you.
          </p>
          <div style={{ marginTop: '24px' }}>
            <a href="#reserve" className="card-link" style={{ fontSize: '16px' }}>Reserve Your Seat &rarr;</a>
          </div>
        </section>

        {/* 3. WHAT THIS EXPERIENCE IS */}
        <section
          className="hero"
          style={{
            backgroundImage: "linear-gradient(180deg, rgba(13,11,9,0.88) 0%, rgba(13,11,9,0.7) 30%, rgba(13,11,9,0.7) 70%, rgba(13,11,9,0.92) 100%), url('/images/Piano hands warm color_EX.png')",
            minHeight: 'auto',
            padding: '100px 24px',
          }}
        >
          <div className="hero-content" style={{ maxWidth: '700px' }}>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '30px', letterSpacing: '0.04em', marginBottom: '36px', color: '#e8dcc8' }}>
              An Evening Inside the Music
            </h2>
            <p className="hero-main-text" style={{ marginBottom: '20px' }}>
              Secret Ballads is a live solo piano or guitar and vocal performance of timeless songs — some iconic, some nearly forgotten — brought back to life in an intimate Manhattan studio setting.
            </p>
            <p className="hero-main-text" style={{ marginBottom: '20px' }}>
              This is not a bar show. It&apos;s not a loud venue. It&apos;s a private musical gathering.
            </p>
            <p className="hero-main-text" style={{ marginBottom: '16px' }}>
              Between songs, Ernie shares the stories behind the music:
            </p>
            <p className="hero-main-text">Why the song was written</p>
            <p className="hero-main-text">What was happening in the artist&apos;s life</p>
            <p className="hero-main-text">The lyrical moments most people overlook</p>
            <p className="hero-main-text">The emotional meaning that still resonates today</p>
            <p className="hero-main-text" style={{ marginTop: '24px', fontStyle: 'italic', color: '#c4a574' }}>
              You won&apos;t just hear the music. You&apos;ll understand why it endures.
            </p>
          </div>
        </section>

        {/* 4. WHAT TO EXPECT */}
        <section style={{ padding: '80px 24px' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '30px', letterSpacing: '0.04em', marginBottom: '40px', color: '#e8dcc8', textAlign: 'center' }}>
              What to Expect
            </h2>
            <div style={{ display: 'flex', gap: '48px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 320px' }}>
                <p className="hero-main-text" style={{ marginBottom: '12px' }}>90-minute live solo performance</p>
                <p className="hero-main-text" style={{ marginBottom: '12px' }}>Piano and/or guitar with vocal</p>
                <p className="hero-main-text" style={{ marginBottom: '12px' }}>Intimate Manhattan studio setting</p>
                <p className="hero-main-text" style={{ marginBottom: '12px' }}>8&ndash;10 guests maximum</p>
                <p className="hero-main-text" style={{ marginBottom: '12px' }}>Storytelling woven between songs</p>
                <p className="hero-main-text">Q&amp;A and informal conversation at the end</p>
              </div>
              <div style={{ flex: '1 1 320px' }}>
                <img
                  src="/images/Piano_room_desktop_hero_no_mixer_EX.jpg"
                  alt="Private piano studio"
                  style={{ width: '100%', height: 'auto', border: '1px solid rgba(196,165,116,0.1)' }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* 5. WHY SMALL MATTERS */}
        <section
          className="hero"
          style={{
            backgroundImage: "linear-gradient(180deg, rgba(13,11,9,0.85) 0%, rgba(13,11,9,0.6) 30%, rgba(13,11,9,0.6) 70%, rgba(13,11,9,0.9) 100%), url('/images/Just 2 people only.jpg')",
            minHeight: 'auto',
            padding: '100px 24px',
          }}
        >
          <div className="hero-content" style={{ maxWidth: '650px' }}>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '30px', letterSpacing: '0.04em', marginBottom: '36px', color: '#e8dcc8' }}>
              Why Only 8&ndash;10 Guests?
            </h2>
            <p className="hero-main-text" style={{ marginBottom: '24px', fontStyle: 'italic', color: '#c4a574' }}>
              Because music changes when the room gets quiet.
            </p>
            <p className="hero-main-text" style={{ marginBottom: '16px' }}>In a small gathering:</p>
            <p className="hero-main-text">You hear every lyric.</p>
            <p className="hero-main-text">You feel every dynamic shift.</p>
            <p className="hero-main-text">You see the hands on the keys.</p>
            <p className="hero-main-text">The performance feels personal — not projected.</p>
            <p className="hero-main-text" style={{ marginTop: '24px' }}>
              Secret Ballads is designed for depth — not volume.
            </p>
            <p className="hero-main-text" style={{ marginTop: '16px', fontStyle: 'italic', color: '#c4a574' }}>
              When the room fills, the evening begins.
            </p>
          </div>
        </section>

        {/* 6. WHO IS ERNIE SAVAGE? */}
        <section style={{ padding: '80px 24px' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '30px', letterSpacing: '0.04em', marginBottom: '40px', color: '#e8dcc8', textAlign: 'center' }}>
              About Ernie Savage
            </h2>
            <div style={{ display: 'flex', gap: '48px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
              <div style={{ flex: '0 0 280px' }}>
                <img
                  src="/images/Ernie Piano looking at keys.jpeg"
                  alt="Ernie Savage"
                  style={{ width: '100%', height: 'auto', border: '1px solid rgba(196,165,116,0.1)' }}
                />
              </div>
              <div style={{ flex: '1 1 320px' }}>
                <p className="hero-main-text" style={{ marginBottom: '16px' }}>
                  Ernie Savage is a Manhattan-based pianist, guitarist, vocalist, and songwriter known for intimate, story-driven performances that blend musical precision with emotional depth.
                </p>
                <p className="hero-main-text" style={{ marginBottom: '16px' }}>
                  His work draws from the golden era of singer-songwriters, orchestral pop, and deeply lyrical ballads — reimagined through solo piano or guitar and voice.
                </p>
                <p className="hero-main-text" style={{ marginBottom: '16px' }}>
                  For decades, Ernie has created salon-style musical evenings that feel personal, intelligent, and immersive.
                </p>
                <p className="hero-main-text" style={{ fontStyle: 'italic', color: '#c4a574' }}>
                  Secret Ballads is the culmination of that approach — performed in one of Manhattan&apos;s most intimate studio environments.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 7. THE ROOM EXPERIENCE */}
        <section
          className="hero"
          style={{
            backgroundImage: "linear-gradient(180deg, rgba(13,11,9,0.85) 0%, rgba(13,11,9,0.55) 30%, rgba(13,11,9,0.55) 70%, rgba(13,11,9,0.9) 100%), url('/images/private-concerts-new.jpg')",
            minHeight: 'auto',
            padding: '100px 24px',
          }}
        >
          <div className="hero-content" style={{ maxWidth: '650px' }}>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '30px', letterSpacing: '0.04em', marginBottom: '24px', color: '#e8dcc8' }}>
              An Evening That Feels Personal
            </h2>
            <p className="hero-main-text" style={{ marginBottom: '16px' }}>
              Guests don&apos;t just listen. They lean in. They remember.
            </p>
            <p className="hero-main-text">
              This is music experienced at conversational distance — where every note matters and every lyric lands.
            </p>
          </div>
        </section>

        {/* 8. DETAILS */}
        <section style={{ padding: '80px 24px', textAlign: 'center' }}>
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '30px', letterSpacing: '0.04em', marginBottom: '40px', color: '#e8dcc8' }}>
              Experience Details
            </h2>
            <p className="hero-main-text">Duration: 90 minutes</p>
            <p className="hero-main-text">Location: Manhattan, New York City</p>
            <p className="hero-main-text">Capacity: 8&ndash;10 guests</p>
            <p className="hero-main-text" style={{ color: '#c4a574' }}>Price: $125 per guest</p>
            <p className="hero-main-text">Setting: Private studio performance space</p>
            <p className="hero-main-text">Seating: Limited and intimate</p>
            <p className="hero-main-text" style={{ marginTop: '16px', fontStyle: 'italic' }}>
              Private bookings available upon request
            </p>
          </div>
        </section>

        {/* 9. FINAL CTA */}
        <section
          className="hero"
          style={{
            backgroundImage: "linear-gradient(180deg, rgba(13,11,9,0.8) 0%, rgba(13,11,9,0.55) 30%, rgba(13,11,9,0.55) 70%, rgba(13,11,9,0.9) 100%), url('/images/behind ernie.jpeg')",
            minHeight: 'auto',
            padding: '120px 24px',
          }}
        >
          <div className="hero-content">
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '36px', letterSpacing: '0.04em', marginBottom: '16px', color: '#e8dcc8' }}>
              Only 10 Seats Per Evening
            </h2>
            <p className="hero-main-text" style={{ fontSize: '20px', fontStyle: 'italic', marginBottom: '32px' }}>
              When the room is full, the experience begins.
            </p>
            <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap', alignItems: 'center' }}>
              <a href="#reserve" className="checkout-btn" style={{ display: 'inline-block', padding: '14px 36px', fontSize: '16px', textDecoration: 'none' }}>
                Reserve Your Seat — $125
              </a>
            </div>
            <div style={{ marginTop: '20px' }}>
              <a href="mailto:booking@erniesavage.com" style={{ color: '#8a7d6d', fontSize: '14px', textDecoration: 'underline' }}>
                Inquire About Private Performance
              </a>
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

      <section className="shows-section">
        <div className="shows-title">Available Dates</div>
        {renderShowCards()}
      </section>
    </main>
  );
}
