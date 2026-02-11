'use client';

import { useEffect, useState } from 'react';

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function handleLogin() {
    if (!password) return;
    setError('');
    try {
      var res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      var data = await res.json();
      if (data.success) {
        setAuthenticated(true);
      } else {
        setError('Incorrect password.');
      }
    } catch (err) {
      setError('Something went wrong.');
    }
  }

  if (!authenticated) {
    return (
      <main>
        <div style={{ maxWidth: 400, margin: '160px auto', padding: '0 24px' }}>
          <h1 style={{ fontSize: '24px', marginBottom: '20px' }}>Admin Dashboard</h1>
          <input
            className="form-input"
            type="password"
            placeholder="Enter admin password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
          />
          {error && <p style={{ color: '#d9534f', fontSize: '14px', marginTop: '8px' }}>{error}</p>}
          <button className="checkout-btn" style={{ marginTop: '16px' }} onClick={handleLogin}>
            Login
          </button>
        </div>
      </main>
    );
  }

  return (
    <main>
      <div style={{ maxWidth: '900px', margin: '120px auto', padding: '0 24px 80px' }}>
        <h1 style={{ fontSize: '28px', marginBottom: '10px' }}>Admin Dashboard</h1>
        <p style={{ color: '#8a7d6d', marginBottom: '40px' }}>Manage shows, view bookings, track revenue.</p>
        <div style={{ display: 'flex', gap: '16px', marginBottom: '40px' }}>
          <a href="/admin/shows" className="checkout-btn" style={{ width: 'auto', display: 'inline-block', textAlign: 'center', textDecoration: 'none' }}>
            Manage Shows
          </a>
        </div>
        <AdminDashboard />
      </div>
    </main>
  );
}

function AdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then((res) => res.json())
      .then((json) => setData(json))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p style={{ color: '#8a7d6d' }}>Loading dashboard...</p>;
  }
  if (!data) {
    return <p style={{ color: '#c4a574' }}>Error loading dashboard data.</p>;
  }

  const tdS: React.CSSProperties = { padding: '12px', fontSize: '14px', color: '#e8dcc8' };
  const thS: React.CSSProperties = {
    textAlign: 'left',
    padding: '10px 12px',
    fontSize: '11px',
    color: '#8a7d6d',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    fontWeight: 500,
  };

  const formatMoney = (cents: number) => {
    return '$' + (cents / 100).toFixed(2);
  };

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '50px' }}>
        {[
          { label: 'Total Bookings', value: data.totalBookings },
          { label: 'Tickets Sold', value: data.totalTickets },
          { label: 'Revenue', value: formatMoney(data.totalRevenue) },
          { label: 'Upcoming Shows', value: data.upcomingShows },
        ].map((stat: any) => (
          <div key={stat.label} style={{ background: 'rgba(35,30,24,0.5)', border: '1px solid rgba(196,165,116,0.12)', padding: '24px', textAlign: 'center' }}>
            <div style={{ fontSize: '28px', color: '#c4a574', fontFamily: "'Playfair Display', serif" }}>{stat.value}</div>
            <div style={{ fontSize: '12px', color: '#8a7d6d', marginTop: '8px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      <h2 style={{ fontSize: '20px', color: '#c4a574', marginBottom: '16px', letterSpacing: '0.05em' }}>Upcoming Shows</h2>
      {(!data.shows || data.shows.length === 0) ? (
        <p style={{ color: '#8a7d6d', marginBottom: '40px' }}>No upcoming shows scheduled.</p>
      ) : (
        <div style={{ marginBottom: '50px', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(196,165,116,0.2)' }}>
                <th style={thS}>Experience</th>
                <th style={thS}>Date</th>
                <th style={thS}>Time</th>
                <th style={thS}>Venue</th>
                <th style={thS}>Seats Left</th>
                <th style={thS}>Status</th>
                <th style={thS}>Guests</th>
              </tr>
            </thead>
            <tbody>
              {data.shows.map((s: any) => (
                <tr key={s.id} onClick={() => window.location.href = '/admin/guests?show_id=' + s.id} style={{ borderBottom: '1px solid rgba(196,165,116,0.08)', cursor: 'pointer' }}>
                  <td style={tdS}>{s.experience_title}</td>
                  <td style={tdS}>{new Date(s.show_date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</td>
                  <td style={tdS}>{formatTime(s.show_time)}</td>
                  <td style={tdS}>{s.venue_name}</td>
                  <td style={tdS}>{s.available_seats}</td>
                  <td style={tdS}>
                    <span style={{ color: s.status === 'scheduled' ? '#7ab87a' : '#c4a574', textTransform: 'capitalize' }}>{s.status}</span>
                  </td>
                  <td style={tdS}>
                    <span style={{ color: '#c4a574', textDecoration: 'underline' }}>View</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <h2 style={{ fontSize: '20px', color: '#c4a574', marginBottom: '16px', letterSpacing: '0.05em' }}>Recent Bookings</h2>
      {(!data.recentBookings || data.recentBookings.length === 0) ? (
        <p style={{ color: '#8a7d6d' }}>No bookings yet.</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(196,165,116,0.2)' }}>
                <th style={thS}>Customer</th>
                <th style={thS}>Contact</th>
                <th style={thS}>Tickets</th>
                <th style={thS}>Amount</th>
                <th style={thS}>Code</th>
                <th style={thS}>Status</th>
                <th style={thS}>Date</th>
              </tr>
            </thead>
            <tbody>
              {data.recentBookings.map((b: any) => (
                <tr key={b.id} style={{ borderBottom: '1px solid rgba(196,165,116,0.08)' }}>
                  <td style={tdS}>{b.customer_name}</td>
                  <td style={tdS}>
                    <div style={{ fontSize: '13px' }}>{b.customer_email}</div>
                    {b.customer_phone && <div style={{ fontSize: '12px', color: '#8a7d6d' }}>{b.customer_phone}</div>}
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
                  <td style={tdS}>
                    <span style={{ fontSize: '13px' }}>{new Date(b.created_at).toLocaleDateString()}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

function formatTime(timeStr: string) {
  var parts = timeStr.split(':');
  var hour = parseInt(parts[0]);
  var min = parts[1];
  var ampm = hour >= 12 ? 'PM' : 'AM';
  var displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  return displayHour + ':' + min + ' ' + ampm;
}
