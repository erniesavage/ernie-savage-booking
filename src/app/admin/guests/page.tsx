'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function GuestListPage() {
  const searchParams = useSearchParams();
  const showId = searchParams.get('show_id');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!showId) return;
    fetch('/api/admin/guests?show_id=' + showId)
      .then((res) => res.json())
      .then((json) => setData(json))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [showId]);

  if (!showId) {
    return (
      <main>
        <div style={{ maxWidth: '900px', margin: '120px auto', padding: '0 24px' }}>
          <p style={{ color: '#c4a574' }}>No show selected.</p>
          <a href="/admin" style={{ color: '#8a7d6d' }}>Back to Dashboard</a>
        </div>
      </main>
    );
  }

  if (loading) {
    return (
      <main>
        <div style={{ maxWidth: '900px', margin: '120px auto', padding: '0 24px' }}>
          <p style={{ color: '#8a7d6d' }}>Loading guest list...</p>
        </div>
      </main>
    );
  }

  if (!data || data.error) {
    return (
      <main>
        <div style={{ maxWidth: '900px', margin: '120px auto', padding: '0 24px' }}>
          <p style={{ color: '#d9534f' }}>Error: {data?.error || 'Could not load guest list'}</p>
          <a href="/admin" style={{ color: '#8a7d6d' }}>Back to Dashboard</a>
        </div>
      </main>
    );
  }

  var show = data.show;
  var bookings = data.bookings || [];
  var tdS: React.CSSProperties = { padding: '12px', fontSize: '14px', color: '#e8dcc8' };
  var thS: React.CSSProperties = {
    textAlign: 'left',
    padding: '10px 12px',
    fontSize: '11px',
    color: '#8a7d6d',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    fontWeight: 500,
  };

  function formatMoney(cents: number) {
    return '$' + (cents / 100).toFixed(2);
  }

  function formatDate(dateStr: string) {
    var d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  }

  function formatTime(timeStr: string) {
    var parts = timeStr.split(':');
    var hour = parseInt(parts[0]);
    var min = parts[1];
    var ampm = hour >= 12 ? 'PM' : 'AM';
    var displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return displayHour + ':' + min + ' ' + ampm;
  }

  return (
    <main>
      <div style={{ maxWidth: '900px', margin: '120px auto', padding: '0 24px 80px' }}>
        <a href="/admin" style={{ color: '#8a7d6d', textDecoration: 'none', fontSize: '14px', letterSpacing: '0.05em' }}>
          &larr; BACK TO DASHBOARD
        </a>

        <h1 style={{ fontSize: '28px', marginTop: '24px', marginBottom: '8px' }}>
          {show.experience_title}
        </h1>
        <p style={{ color: '#c4a574', fontSize: '16px', marginBottom: '8px' }}>
          {formatDate(show.show_date)} at {formatTime(show.show_time)}
        </p>
        <p style={{ color: '#8a7d6d', fontSize: '14px', marginBottom: '32px' }}>
          {show.venue_name} &mdash; {show.venue_address}
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '40px' }}>
          {[
            { label: 'Confirmed Bookings', value: data.confirmedBookings },
            { label: 'Total Guests', value: data.totalGuests },
            { label: 'Seats Remaining', value: show.available_seats },
            { label: 'Revenue', value: formatMoney(data.totalRevenue) },
          ].map((stat: any) => (
            <div key={stat.label} style={{ background: 'rgba(35,30,24,0.5)', border: '1px solid rgba(196,165,116,0.12)', padding: '20px', textAlign: 'center' }}>
              <div style={{ fontSize: '24px', color: '#c4a574', fontFamily: "'Playfair Display', serif" }}>{stat.value}</div>
              <div style={{ fontSize: '11px', color: '#8a7d6d', marginTop: '6px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{stat.label}</div>
            </div>
          ))}
        </div>

        <h2 style={{ fontSize: '20px', color: '#c4a574', marginBottom: '16px', letterSpacing: '0.05em' }}>
          Guest List
        </h2>

        {bookings.length === 0 ? (
          <p style={{ color: '#8a7d6d' }}>No bookings for this show yet.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(196,165,116,0.2)' }}>
                  <th style={thS}>#</th>
                  <th style={thS}>Name</th>
                  <th style={thS}>Email</th>
                  <th style={thS}>Phone</th>
                  <th style={thS}>Tickets</th>
                  <th style={thS}>Amount</th>
                  <th style={thS}>Code</th>
                  <th style={thS}>Status</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b: any, i: number) => (
                  <tr key={b.id} style={{ borderBottom: '1px solid rgba(196,165,116,0.08)' }}>
                    <td style={tdS}>{i + 1}</td>
                    <td style={{ ...tdS, fontWeight: 600 }}>{b.customer_name}</td>
                    <td style={tdS}>
                      <a href={'mailto:' + b.customer_email} style={{ color: '#c4a574', textDecoration: 'none' }}>{b.customer_email}</a>
                    </td>
                    <td style={tdS}>
                      {b.customer_phone ? (
                        <a href={'tel:' + b.customer_phone} style={{ color: '#c4a574', textDecoration: 'none' }}>{b.customer_phone}</a>
                      ) : (
                        <span style={{ color: '#8a7d6d' }}>--</span>
                      )}
                    </td>
                    <td style={tdS}>{b.ticket_count}</td>
                    <td style={tdS}>{formatMoney(b.total_cents)}</td>
                    <td style={tdS}>
                      <span style={{ fontFamily: 'monospace', color: '#c4a574', fontSize: '13px' }}>{b.ticket_code}</span>
                    </td>
                    <td style={tdS}>
                      <span style={{
                        color: b.stripe_payment_status === 'succeeded' ? '#7ab87a' : b.stripe_payment_status === 'refunded' ? '#c4a574' : '#d9534f',
                        textTransform: 'capitalize',
                      }}>{b.stripe_payment_status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {show.venue_notes && (
          <div style={{ marginTop: '40px', padding: '20px', background: 'rgba(35,30,24,0.5)', border: '1px solid rgba(196,165,116,0.12)' }}>
            <h3 style={{ fontSize: '14px', color: '#c4a574', marginBottom: '8px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Arrival Notes</h3>
            <p style={{ color: '#e8dcc8', fontSize: '14px' }}>{show.venue_notes}</p>
          </div>
        )}
      </div>
    </main>
  );
}
