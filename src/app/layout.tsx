import './globals.css';
import type { Metadata } from 'next';
import Link from 'next/link';
import Script from 'next/script';
import { headers } from 'next/headers';

const ERNIE: Metadata = {
  title: 'Ernie Savage — Singer/Songwriter, Composer and Storyteller',
  description:
    'Ernie Savage is a New York-based composer, songwriter, and performer. Creator of Celebrate Nilsson, Secret Ballads NYC, and Celebrate the Songwriters: Radio 1967-1977 — songs and stories on piano and guitar.',
  icons: { icon: '/favicon.ico', apple: '/apple-touch-icon.png' },
  openGraph: {
    title: 'Ernie Savage — Singer/Songwriter, Composer and Storyteller',
    description: 'Celebrate Nilsson, Secret Ballads NYC, and Celebrate the Songwriters: Radio 1967-1977 — songs and stories on piano and guitar.',
    url: 'https://www.erniesavage.com',
    siteName: 'Ernie Savage',
    images: [{ url: 'https://www.erniesavage.com/images/HP_1_Hero_Image_Piano_and_Room_.jpg', width: 1200, height: 630, alt: 'Ernie Savage' }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ernie Savage — Singer/Songwriter, Composer and Storyteller',
    description: 'Celebrate Nilsson, Secret Ballads NYC, and Celebrate the Songwriters: Radio 1967-1977 — songs and stories on piano and guitar.',
    images: ['https://www.erniesavage.com/images/HP_1_Hero_Image_Piano_and_Room_.jpg'],
  },
};

const NILSSON: Metadata = {
  title: 'Celebrate Nilsson — The Songs and Story of Harry Nilsson',
  description:
    'An intimate evening of the songs, the stories behind them, and the man himself — presented and performed by Ernie Savage on piano, guitar and voice. Live in New York.',
  icons: {
    icon: [
      { url: '/cn-favicon.ico' },
      { url: '/cn-favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/cn-favicon-16.png', sizes: '16x16', type: 'image/png' },
      { url: '/cn-icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: '/cn-apple-touch-icon.png',
  },
  openGraph: {
    title: 'Celebrate Nilsson — The Songs and Story of Harry Nilsson',
    description: 'An intimate evening of the songs, the stories behind them, and the man himself — presented and performed by Ernie Savage. Live in New York.',
    url: 'https://celebratenilsson.com',
    siteName: 'Celebrate Nilsson',
    images: [{ url: 'https://www.erniesavage.com/images/CN_OG_1200x630.jpg', width: 1200, height: 630, alt: 'Celebrate Nilsson' }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Celebrate Nilsson — The Songs and Story of Harry Nilsson',
    description: 'An intimate evening of the songs, the stories behind them, and the man himself — presented and performed by Ernie Savage.',
    images: ['https://www.erniesavage.com/images/CN_OG_1200x630.jpg'],
  },
};

// Set by src/middleware.ts: 'nilsson' on celebratenilsson.com / .org, 'ernie' everywhere else.
function currentSite() {
  return headers().get('x-site') === 'nilsson' ? 'nilsson' : 'ernie';
}

export function generateMetadata(): Metadata {
  return currentSite() === 'nilsson' ? NILSSON : ERNIE;
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const site = currentSite();

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
        {site === 'nilsson' ? (
          <nav>
            <Link href="/" className="logo">
              Celebrate Nilsson
            </Link>
            <div className="nav-links">
              <Link href="/#watch">Watch</Link>
              <Link href="/#signup">Sign up</Link>
              <a href="https://www.erniesavage.com/#about">Ernie Savage</a>
            </div>
          </nav>
        ) : (
          <nav>
            <Link href="/" className="logo">
              Ernie Savage
            </Link>
            <div className="nav-links">
              <Link href="/#experiences">Experiences</Link>
              <Link href="/#about">About</Link>
            </div>
          </nav>
        )}
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
