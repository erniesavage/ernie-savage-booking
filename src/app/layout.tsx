import './globals.css';
import type { Metadata } from 'next';
import Link from 'next/link';

import Script from 'next/script';

export const metadata: Metadata = {
  title: 'Ernie Savage | Intimate Music Experiences',
  description:
    'Intimate music experiences featuring classic ballads, timeless songs, and real connection. Small gatherings of 8–10 in New York City.',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: 'Ernie Savage | Intimate Music Experiences',
    description: 'Classic ballads, timeless songs, and real connection. Small gatherings of 8–10 in New York City.',
    url: 'https://www.erniesavage.com',
    siteName: 'Ernie Savage',
    images: [
      {
        url: 'https://www.erniesavage.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Ernie Savage - Intimate Music Experiences',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ernie Savage | Intimate Music Experiences',
    description: 'Classic ballads, timeless songs, and real connection. Small gatherings of 8–10 in New York City.',
    images: ['https://www.erniesavage.com/og-image.png'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-GBFTTC1KRL" strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-GBFTTC1KRL');
          `}
        </Script>
      </head>
      <body>
        <nav>
          <Link href="/" className="logo">
            Ernie Savage
          </Link>
          <div className="nav-links">
            <Link href="/#experiences">Experiences</Link>
            <Link href="/#about">About</Link>
          </div>
        </nav>
        {children}
        <footer>
          <p className="footer-copy">© 2026 Ernie Savage. All rights reserved.</p>
          <p className="footer-company">Ernie Savage, LLC</p>
          <p style={{ marginTop: '12px', fontSize: '12px' }}>
            <Link href="/privacy" style={{ color: '#5a4d3d', textDecoration: 'none', marginRight: '16px' }}>Privacy Policy</Link>
            <Link href="/terms" style={{ color: '#5a4d3d', textDecoration: 'none' }}>Terms &amp; Conditions</Link>
          </p>
          <p style={{ marginTop: '16px', fontSize: '11px', color: '#5a4d3d', maxWidth: '500px', margin: '16px auto 0', lineHeight: 1.6, textAlign: 'center' }}>
            SMS Consent: During ticket checkout, customers may opt in to receive a one-time SMS booking confirmation from Ernie Savage by selecting &quot;SMS&quot; or &quot;Email &amp; SMS.&quot; Msg &amp; data rates may apply. Reply STOP to opt out, HELP for help. No recurring messages. See our <Link href="/privacy" style={{ color: '#8a7d6d', textDecoration: 'underline' }}>Privacy Policy</Link> and <Link href="/terms" style={{ color: '#8a7d6d', textDecoration: 'underline' }}>Terms</Link>.
          </p>
        </footer>
      </body>
    </html>
  );
}
