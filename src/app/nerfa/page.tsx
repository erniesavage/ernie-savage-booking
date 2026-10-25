import type { Metadata } from 'next';
import './nerfa.css';

// Re-check the date once an hour so the TONIGHT tag moves on its own during the conference.
export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Celebrate Nilsson at NERFA 2026 — Room 169',
  description:
    'Three nights of melody, story, and heart, in the spirit of Harry Nilsson. Room 169, The Desmond, Albany, November 12–14, 2026.',
  alternates: { canonical: 'https://celebratenilsson.com/nerfa' },
  openGraph: {
    title: 'Celebrate Nilsson at NERFA 2026 — Room 169',
    description:
      'Three nights of melody, story, and heart, in the spirit of Harry Nilsson. Room 169, nightly from 10:30 PM.',
    url: 'https://celebratenilsson.com/nerfa',
    images: ['/og-image.png'],
  },
};

type Slot = { time: string; name: string; note?: string; url?: string };
type Night = { key: string; day: string; date: string; slots: Slot[] };

const NIGHTS: Night[] = [
  {
    key: '2026-11-12',
    day: 'Thursday',
    date: 'November 12',
    slots: [
      { time: '10:30', name: 'Ernie Savage', note: 'Celebrate Nilsson' },
      { time: '11:00', name: 'Matt Nakoa', url: 'https://mattnakoa.com' },
      { time: '11:30', name: 'Wolftrap', url: 'https://wolftrap.band' },
      { time: '11:50', name: 'Eddie D and the Guarantee', url: 'https://eddiedandtheguarantee.com' },
    ],
  },
  {
    key: '2026-11-13',
    day: 'Friday',
    date: 'November 13',
    slots: [
      { time: '10:30', name: 'Ernie Savage', note: 'Celebrate Nilsson' },
      { time: '11:00', name: 'Chelsea Berry', url: 'https://chelseaberry.com' },
      { time: '11:30', name: 'Claire Wellin', url: 'https://www.clairewellin.com' },
      { time: '12:00', name: 'Kemp Harris', url: 'https://kempharris.band' },
      { time: '12:30', name: 'Ernie Savage', note: 'Celebrate the Songwriters: 1967–1987' },
    ],
  },
  {
    key: '2026-11-14',
    day: 'Saturday',
    date: 'November 14',
    slots: [
      { time: '10:30', name: 'Ernie Savage', note: 'Celebrate Nilsson' },
      { time: '11:00', name: 'The Refugees', url: 'https://therefugeesmusic.com', note: 'Wendy Waldman, Cidny Bullens, Deborah Holland' },
      { time: '11:30', name: 'Hope Dunbar', url: 'https://hopedunbarmusic.com' },
      { time: '11:50', name: 'Juliet Lloyd', url: 'https://julietlloyd.com' },
    ],
  },
];

// Today's date in Albany/New York time, as YYYY-MM-DD.
// Until 4 AM, the evening still counts as "tonight" for anyone checking during the circle.
function todayInNewYork(): string {
  const shifted = new Date(Date.now() - 4 * 60 * 60 * 1000);
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(shifted);
}

export default function NerfaPage() {
  const today = todayInNewYork();

  return (
    <>
      <main className="nerfa">
        <header className="nerfa-head">
          <img
            className="nerfa-logo"
            src="/Celebrate_Nilsson_Transparency_Logo_w_Ernie_Original_Size.png"
            alt="Celebrate Nilsson"
            width={1536}
            height={1024}
          />
          <p className="nerfa-eyebrow">NERFA 2026 · The Desmond, Albany</p>
          <p className="nerfa-room-number">Room 169</p>
          <p className="nerfa-nightly">Thursday, Friday, Saturday · 10:30 PM</p>
          <h1 className="nerfa-title">Three nights of melody, story, and heart, in the spirit of Harry Nilsson.</h1>
        </header>

        <section className="nerfa-nights" aria-label="Schedule">
          {NIGHTS.map((night) => {
            const tonight = night.key === today;
            return (
              <article key={night.key} className={tonight ? 'night tonight' : 'night'}>
                <header className="night-head">
                  {tonight && <span className="night-tag">Tonight</span>}
                  <h2 className="night-day">{night.day}</h2>
                  <p className="night-date">{night.date}</p>
                </header>
                <ul className="slots">
                  {night.slots.map((slot) => (
                    <li key={slot.time + slot.name} className="slot">
                      <span className="slot-time">{slot.time}</span>
                      <span className="slot-name">
                        {slot.url ? (
                          <a href={slot.url} target="_blank" rel="noopener" className="slot-link">
                            {slot.name}
                          </a>
                        ) : (
                          slot.name
                        )}
                        {slot.note && <span className="slot-note">{slot.note}</span>}
                      </span>
                    </li>
                  ))}
                  <li className="slot slot-circle">
                    <span className="slot-time">after</span>
                    <span className="slot-name">
                      Zero Dark Circle
                      <span className="slot-note">Open song circle. Show up and sing.</span>
                    </span>
                  </li>
                </ul>
              </article>
            );
          })}
        </section>

        <section className="zdc" aria-label="Zero Dark Circle">
          <div className="zdc-badge">
            <img src="/ZDC_Sticker_2026.png" alt="Zero Dark Circle" width={2000} height={2000} />
          </div>
          <div className="zdc-text">
            <h2 className="zdc-title">Zero Dark Circle</h2>
            <p>After the last set, every night, till whenever. Bring a song.</p>
            <p>Piano keyboard available for all artists.</p>
          </div>
        </section>

        <section className="nerfa-room">
          <p>
            Ernie opens each night with a short set from his Celebrate Nilsson show, a concert portrait of Harry
            Nilsson. Featured showcase artists sing their own songs, and a Harry song if they wish.
          </p>
        </section>

        <section className="nerfa-more">
          <a href="/#shows" className="card-link">See the full show: December 6 and January 15, Michiko Studios</a>
          <a href="/booking" className="card-link">Bring Celebrate Nilsson to your room</a>
        </section>
      </main>

    </>
  );
}
