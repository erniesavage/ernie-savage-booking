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
    // Shared section style for clean text sections
    var sectionStyle = { padding: '80px 24px', maxWidth: '720px', margin: '0 auto' } as const;
    var h2Style = { fontFamily: "'Playfair Display', serif", fontSize: '28px', letterSpacing: '0.04em', marginBottom: '36px', color: '#e8dcc8', textAlign: 'center' as const };
    var bodyStyle = { fontSize: '17px', lineHeight: 1.8, color: '#c8bda8', marginBottom: '20px' };
    var breathStyle = { fontSize: '17px', lineHeight: 2.2, color: '#c8bda8', marginBottom: '8px' };

    return (
      <main>
        {/* SECTION 1 — HERO */}
        <section
          className="hero"
          style={{
            backgroundImage: "linear-gradient(180deg, rgba(13,11,9,0.55) 0%, rgba(13,11,9,0.3) 30%, rgba(13,11,9,0.5) 60%, rgba(13,11,9,0.95) 100%), url('/images/behind ernie.jpeg')",
            minHeight: 'auto',
            padding: '160px 24px 80px',
          }}
        >
          <div className="hero-content" style={{ maxWidth: '720px' }}>
            <h1 style={{ fontSize: '44px', letterSpacing: '0.12em', marginBottom: '20px', textTransform: 'uppercase' }}>Secret Ballads NYC</h1>
            <p style={{ fontSize: '20px', color: '#c8bda8', fontStyle: 'italic', lineHeight: 1.7, marginBottom: '32px' }}>
              An intimate piano &amp; vocal salon of iconic and forgotten ballads.
            </p>
            <p style={{ ...bodyStyle, textAlign: 'center', maxWidth: '600px', margin: '0 auto 28px' }}>
              Inside a private Manhattan studio near Bryant Park and the Empire State Building, composer and performer Ernie Savage presents a close-listening concert devoted to the great pop ballads of the American singer-songwriter era.
            </p>
            <p style={{ ...breathStyle, textAlign: 'center' }}>This is not a club performance.</p>
            <p style={{ ...breathStyle, textAlign: 'center' }}>This is not background music.</p>
            <p style={{ ...breathStyle, textAlign: 'center', marginTop: '20px', fontStyle: 'italic', color: '#c4a574' }}>
              This is a room small enough for the music to breathe.
            </p>
          </div>
        </section>

        {/* SECTION 2 — THE CONCEPT */}
        <section style={sectionStyle}>
          <h2 style={h2Style}>The Concept</h2>
          <p style={bodyStyle}>
            Secret Ballads explores iconic and nearly forgotten songs from the golden era of American songwriting — works shaped by melody, restraint, and emotional precision.
          </p>
          <p style={{ ...bodyStyle, marginBottom: '12px' }}>Songs associated with artists such as:</p>
          <p style={{ fontSize: '16px', color: '#c4a574', lineHeight: 2.2, textAlign: 'center', letterSpacing: '0.02em', marginBottom: '24px' }}>
            Elton John &nbsp;&middot;&nbsp; Paul Simon &nbsp;&middot;&nbsp; Leonard Cohen &nbsp;&middot;&nbsp; Harry Nilsson<br />
            Billy Joel &nbsp;&middot;&nbsp; Don McLean &nbsp;&middot;&nbsp; Jimmy Webb
          </p>
          <p style={bodyStyle}>
            are reinterpreted through solo piano, acoustic guitar, and voice — performed within conversational distance of the audience.
          </p>
          <p style={bodyStyle}>
            Between performances, Ernie shares brief reflections on the writers, the era, and the craft behind the songs — offering context without interrupting the flow.
          </p>
          <p style={{ ...bodyStyle, fontStyle: 'italic', color: '#c4a574' }}>
            The result is a focused listening experience that rewards attention.
          </p>
        </section>

        {/* SECTION 3 — THE SETTING */}
        <section style={{ ...sectionStyle, borderTop: '1px solid rgba(196,165,116,0.1)', paddingTop: '80px' }}>
          <h2 style={h2Style}>The Setting</h2>
          <p style={{ ...bodyStyle, textAlign: 'center', marginBottom: '8px' }}>Secret Ballads is hosted at</p>
          <p style={{ fontSize: '18px', color: '#e8dcc8', textAlign: 'center', lineHeight: 1.8, marginBottom: '6px', fontWeight: 500 }}>
            Michiko Studios
          </p>
          <p style={{ fontSize: '16px', color: '#c8bda8', textAlign: 'center', lineHeight: 1.8, marginBottom: '4px' }}>
            15 West 39th Street, 7th Floor
          </p>
          <p style={{ fontSize: '15px', color: '#8a7d6d', textAlign: 'center', lineHeight: 1.8, marginBottom: '4px' }}>
            Between 5th and 6th Avenues
          </p>
          <p style={{ fontSize: '15px', color: '#8a7d6d', textAlign: 'center', lineHeight: 1.8, marginBottom: '32px' }}>
            Steps from Bryant Park and the New York Public Library
          </p>
          <p style={bodyStyle}>
            The studio is an active working rehearsal space — simple, acoustic, unpolished.
          </p>
          <p style={bodyStyle}>
            There is no theatrical lighting. No stage separation. No amplified spectacle.
          </p>
          <p style={{ ...bodyStyle, fontStyle: 'italic', color: '#c4a574' }}>
            Just a piano, a guitar, a voice — and a room designed for listening.
          </p>
        </section>

        {/* SECTION 4 — THE EXPERIENCE */}
        <section style={{ ...sectionStyle, borderTop: '1px solid rgba(196,165,116,0.1)', paddingTop: '80px' }}>
          <h2 style={h2Style}>The Experience</h2>
          <div style={{ marginBottom: '32px' }}>
            <p style={breathStyle}>&bull;&ensp;75&ndash;90 minute curated live performance</p>
            <p style={breathStyle}>&bull;&ensp;Solo piano, guitar, and voice</p>
            <p style={breathStyle}>&bull;&ensp;Limited to 8 guests</p>
            <p style={breathStyle}>&bull;&ensp;Seated, salon-style listening</p>
            <p style={breathStyle}>&bull;&ensp;Stories and musical context woven throughout</p>
            <p style={breathStyle}>&bull;&ensp;Informal conversation after the final song</p>
          </div>
          <p style={{ ...bodyStyle, marginTop: '16px' }}>
            Guests are seated within feet of the instrument.
          </p>
          <p style={breathStyle}>You hear the breath before the lyric. You see the hands strike the keys. You feel the silence between phrases.</p>
          <p style={{ ...bodyStyle, marginTop: '20px', fontStyle: 'italic', color: '#c4a574' }}>
            This is proximity — not production.
          </p>
        </section>

        {/* SECTION 5 — WHY ONLY EIGHT GUESTS? */}
        <section style={{ ...sectionStyle, borderTop: '1px solid rgba(196,165,116,0.1)', paddingTop: '80px' }}>
          <h2 style={h2Style}>Why Only Eight Guests?</h2>
          <p style={{ ...bodyStyle, fontStyle: 'italic', color: '#c4a574', textAlign: 'center', marginBottom: '28px' }}>
            Because these songs were never meant to compete with noise.
          </p>
          <p style={{ ...bodyStyle, marginBottom: '16px' }}>The scale is deliberate.</p>
          <p style={{ ...bodyStyle, marginBottom: '12px' }}>A smaller room allows:</p>
          <div style={{ marginBottom: '28px' }}>
            <p style={breathStyle}>&bull;&ensp;Emotional nuance</p>
            <p style={breathStyle}>&bull;&ensp;Dynamic control</p>
            <p style={breathStyle}>&bull;&ensp;Direct connection</p>
            <p style={breathStyle}>&bull;&ensp;Shared stillness</p>
          </div>
          <p style={{ ...bodyStyle, fontStyle: 'italic', color: '#c4a574' }}>
            Secret Ballads is designed for intimacy, not volume.
          </p>
        </section>

        {/* SECTION 6 — ABOUT ERNIE SAVAGE */}
        <section style={{ ...sectionStyle, borderTop: '1px solid rgba(196,165,116,0.1)', paddingTop: '80px' }}>
          <h2 style={h2Style}>About Ernie Savage</h2>
          <p style={bodyStyle}>
            Ernie Savage is a New York&ndash;based composer, pianist, guitarist, and recording artist whose career spans television scoring, international performance, and decades of live concerts.
          </p>
          <p style={bodyStyle}>
            He has composed themes and music for major broadcast networks and led ensembles ranging from solo piano to full 10-piece bands. His work reflects a deep commitment to melodic songwriting and emotional clarity.
          </p>
          <p style={{ ...bodyStyle, fontStyle: 'italic', color: '#c4a574' }}>
            Secret Ballads represents the distilled version of that career — one performer, one instrument, one room.
          </p>
        </section>

        {/* SECTION 7 — RESERVATIONS */}
        <section className="shows-section" id="reserve" style={{ borderTop: '1px solid rgba(196,165,116,0.1)' }}>
          <div className="shows-title">Reservations</div>
          {renderShowCards()}
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
