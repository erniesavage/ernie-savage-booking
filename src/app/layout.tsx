import './globals.css';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Ernie Savage | Intimate Music Experiences',
  description:
    'Intimate music experiences featuring classic ballads, timeless songs, and real connection. Small gatherings of 8–10 in Rockland Lake, New York.',
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
        </footer>
      </body>
    </html>
  );
}
