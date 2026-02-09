'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function BookingConfirmedPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) return;

    async function fetchConfirmation() {
      try {
        const res = await fetch(`/api/confirm?session_id=${sessionId}`);
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchConfirmation();
  }, [sessionId]);

  function formatDate(dateStr: string) {
    if (!dateStr || dateStr === 'Unknown') return 'TBD';
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  }

  function formatTime(timeStr: string) {
    if (!timeStr || timeStr === 'Unknown') return 'TBD';
    const [h, m] = timeStr.split(':');
    const hour = parseInt(h);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const h12 = hour % 12 || 12;
    return `${h12}:${m} ${ampm}`;
  }

  if (loading) {
    return (
      <main>
        <div className="confirm-page">
          <p style={{ color: '#8a7d6d', fontSize: '17px' }}>
            Loading your confirmation...
          </p>
        </div>
      </main>
    );
  }

  if (!data || data.error) {
    return (
      <main>
        <div className="confirm-page">
          <h1>Booking Confirmed</h1>
          <p style={{ color: '#9a8b7a', margin: '20px 0' }}>
            Your payment was successful. Your confirmation details will arrive shortly via
            email and/or text.
          </p>
          <Link href="/" className="card-link" style={{ justifyContent: 'center' }}>
            Back to Experiences
          </Link>
        </div>
      </main>
    );
  }

  const { booking, show, experience } = data;

  return (
    <main>
      <div className="confirm-page">
        <div className="confirm-check">🎵</div>
        <h1>You&apos;re In.</h1>
        <p style={{ color: '#9a8b7a', fontSize: '17px', margin: '10px 0 30px' }}>
          {booking.customer_name}, your spot is confirmed.
        </p>

        <div
          className="confirm-ticket-code"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          {booking.ticket_code || 'Processing...'}
        </div>

        <div className="confirm-details">
          <p>
            <strong style={{ color: '#c4a574' }}>{experience.title}</strong>
          </p>
          <p>{formatDate(show.show_date)}</p>
          <p>{formatTime(show.show_time)}</p>
          <p>{show.venue_name}</p>
          {show.venue_address && <p>{show.venue_address}</p>}
          <p>
            {booking.ticket_count} ticket{booking.ticket_count > 1 ? 's' : ''}
          </p>
        </div>

        {show.venue_notes && (
          <div style={{ margin: '20px 0', textAlign: 'left' }}>
            <div
              className="form-label"
              style={{ textAlign: 'center', marginBottom: '10px' }}
            >
              Arrival Notes
            </div>
            <p style={{ color: '#9a8b7a', lineHeight: 1.7 }}>{show.venue_notes}</p>
          </div>
        )}

        <p style={{ color: '#5a4d3d', fontSize: '14px', marginTop: '30px' }}>
          A confirmation has been sent to your email and/or phone. See you there.
        </p>

        <div style={{ marginTop: '40px' }}>
          <Link href="/" className="card-link" style={{ justifyContent: 'center' }}>
            Back to Experiences
          </Link>
        </div>
      </div>
    </main>
  );
}
