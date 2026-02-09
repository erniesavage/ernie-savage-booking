'use client';

import { useEffect, useState } from 'react';

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');

  // For demo: simple password check — replace with proper auth in production
  function handleLogin() {
    // This will be validated server-side; for now simple client gate
    if (password) {
      setAuthenticated(true);
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
          <button
            className="checkout-btn"
            style={{ marginTop: '16px' }}
            onClick={handleLogin}
          >
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
        <p style={{ color: '#8a7d6d', marginBottom: '40px' }}>
          Manage shows, view bookings, track revenue.
        </p>

        <div style={{ display: 'flex', gap: '16px', marginBottom: '40px' }}>
          <a
            href="/admin/shows"
            className="checkout-btn"
            style={{
              width: 'auto',
              display: 'inline-block',
              textAlign: 'center',
              textDecoration: 'none',
            }}
          >
            Manage Shows
          </a>
        </div>

        <AdminStats />
      </div>
    </main>
  );
}

function AdminStats() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    // Stats would be fetched from a protected API route
    // For now, placeholder
    setStats({
      totalBookings: '—',
      totalRevenue: '—',
      upcomingShows: '—',
    });
  }, []);

  if (!stats) return null;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
      {[
        { label: 'Total Bookings', value: stats.totalBookings },
        { label: 'Revenue', value: stats.totalRevenue },
        { label: 'Upcoming Shows', value: stats.upcomingShows },
      ].map((stat) => (
        <div
          key={stat.label}
          style={{
            background: 'rgba(35,30,24,0.5)',
            border: '1px solid rgba(196,165,116,0.12)',
            padding: '24px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontSize: '28px',
              color: '#c4a574',
              fontFamily: "'Playfair Display', serif",
            }}
          >
            {stat.value}
          </div>
          <div style={{ fontSize: '12px', color: '#8a7d6d', marginTop: '8px', letterSpacing: '0.1em', textTransform: 'uppercase' as const }}>
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  );
}
