import './globals.css';
import type { Metadata } from 'next';
import Link from 'next/link';

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
        </footer>
      </body>
    </html>
  );
}
