// src/app/celebrate-nilsson/page.tsx — Celebrate Nilsson landing page (layout v2: dates first)
// Served at the root of celebratenilsson.com (via src/middleware.ts) and at erniesavage.com/celebrate-nilsson
import NilssonSignup from '../../components/NilssonSignup';
import NilssonTickets from '../../components/NilssonTickets';

// ---- EDIT HERE when the Remember (Christmas) upload is ready: paste the YouTube video ID (the part after v= or youtu.be/) ----
const REMEMBER_VIDEO_ID = '';

const OG_IMAGE = 'https://www.erniesavage.com/images/CN_OG_1200x630.jpg';

export const metadata = {
  title: 'Celebrate Nilsson — The Songs and Story of Harry Nilsson · Live in New York',
  description:
    'An intimate evening of the songs, the stories behind them, and the man himself — presented and performed by Ernie Savage on piano, guitar and voice. Tickets for New York dates, and first access to new shows by email or text.',
  alternates: { canonical: 'https://celebratenilsson.com' },
  openGraph: {
    title: 'Celebrate Nilsson — The Songs and Story of Harry Nilsson',
    description:
      'An intimate evening of the songs, stories and life of Harry Nilsson, presented and performed by Ernie Savage. Live in New York.',
    url: 'https://celebratenilsson.com',
    siteName: 'Celebrate Nilsson',
    type: 'website',
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: 'Celebrate Nilsson' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Celebrate Nilsson — The Songs and Story of Harry Nilsson',
    description: 'An intimate evening of the songs, stories and life of Harry Nilsson, presented and performed by Ernie Savage.',
    images: [OG_IMAGE],
  },
};

const CSS = `
  :root{
    --cn-night:#121110;
    --cn-night-2:#1c1916;
    --cn-ivory:#efe7d5;
    --cn-ivory-dim:#c4b9a3;
    --cn-gold:#f2c230;
    --cn-hairline:rgba(242,194,48,.26);
  }
  body{background:var(--cn-night);color:var(--cn-ivory);font-family:"Newsreader",Georgia,serif;font-size:19px;line-height:1.65;-webkit-font-smoothing:antialiased}
  .cn-wrap{max-width:1000px;margin:0 auto;padding:0 24px}

  .cn-hero{padding:28px 0 0}
  .cn-hero img{width:100%;display:block;border-radius:6px;border:1px solid var(--cn-hairline)}
  .cn-hero h1{font-family:"Fraunces",serif;font-weight:340;font-size:clamp(26px,3.8vw,40px);line-height:1.12;text-align:center;margin:28px auto 6px;max-width:24ch}
  .cn-hero .cn-sub{text-align:center;color:var(--cn-ivory-dim);font-size:19px;margin:0}

  .cn-section{padding:44px 0;border-bottom:1px solid var(--cn-hairline)}
  .cn-label{font-family:"Archivo",sans-serif;font-size:13px;letter-spacing:.06em;color:var(--cn-ivory-dim);margin:0 0 14px}

  .cn-dates{border-top:1px solid var(--cn-hairline)}
  .cn-date{border-bottom:1px solid var(--cn-hairline);padding:20px 0}
  .cn-date-row{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:16px 24px;align-items:center}
  .cn-date-title{font-family:"Fraunces",serif;font-weight:560;font-size:clamp(20px,2.6vw,26px);line-height:1.2}
  .cn-date-sub{color:var(--cn-ivory-dim);font-size:17px;margin-top:4px}
  .cn-dates-note{color:var(--cn-ivory-dim);padding:18px 0}
  @media (max-width:640px){.cn-date-row{grid-template-columns:1fr}}

  .cn-intro p{font-size:clamp(19px,2.2vw,22px);line-height:1.6;max-width:62ch;margin:0 auto 18px;text-align:center}
  .cn-intro p:last-child{margin-bottom:0}

  .cn-grid3{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:22px}
  @media (max-width:820px){.cn-grid3{grid-template-columns:1fr}}
  .cn-vid{position:relative;aspect-ratio:16/9;border:1px solid var(--cn-hairline);border-radius:6px;overflow:hidden;background:var(--cn-night-2)}
  .cn-vid iframe{position:absolute;inset:0;width:100%;height:100%;border:0}
  .cn-vid-soon{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:var(--cn-ivory-dim);font-family:"Archivo",sans-serif;font-size:14px;letter-spacing:.04em}
  .cn-vid-title{font-family:"Fraunces",serif;font-weight:560;font-size:19px;margin:12px 0 2px}
  .cn-vid-sub{color:var(--cn-ivory-dim);font-size:15px;line-height:1.5;margin:0}

  .cn-signup h2{font-family:"Fraunces",serif;font-weight:340;font-size:clamp(26px,3.6vw,36px);line-height:1.15;text-align:center;margin:0 auto 10px;max-width:26ch}
  .cn-signup .cn-lede{text-align:center;color:var(--cn-ivory-dim);max-width:52ch;margin:0 auto 30px;font-size:17px}

  .cn-form,.cn-checkout{max-width:520px;margin:0 auto}
  .cn-checkout{margin:18px 0 0;padding:22px;border:1px solid var(--cn-hairline);border-radius:8px;background:var(--cn-night-2)}
  .cn-field{margin-bottom:16px}
  .cn-field label{display:block;font-family:"Archivo",sans-serif;font-size:14px;color:var(--cn-ivory-dim);margin-bottom:6px}
  .cn-field input[type=text],.cn-field input[type=email],.cn-field input[type=tel],.cn-field select{
    width:100%;font-family:"Newsreader",Georgia,serif;font-size:18px;color:var(--cn-ivory);
    background:var(--cn-night);border:1px solid var(--cn-hairline);border-radius:6px;padding:11px 14px;
  }
  .cn-field input:focus-visible,.cn-field select:focus-visible{outline:2px solid var(--cn-gold);outline-offset:2px}
  .cn-radios{display:flex;gap:22px;flex-wrap:wrap;font-size:17px}
  .cn-radios label{display:flex;align-items:center;gap:8px;color:var(--cn-ivory);font-family:"Newsreader",Georgia,serif;font-size:17px;margin:0}
  .cn-radios input{accent-color:var(--cn-gold);width:18px;height:18px}
  .cn-check{display:flex;gap:12px;align-items:flex-start;margin:12px 0;font-size:15px;line-height:1.5;color:var(--cn-ivory-dim)}
  .cn-check input{margin-top:5px;width:18px;height:18px;accent-color:var(--cn-gold);flex:none}
  .cn-check a{color:var(--cn-ivory-dim);text-decoration:underline}
  .cn-fine{font-size:13px;color:var(--cn-ivory-dim);line-height:1.5;margin:8px 0 0}
  .cn-btn{
    display:block;width:100%;margin-top:18px;padding:14px 22px;
    font-family:"Archivo",sans-serif;font-weight:600;font-size:16px;letter-spacing:.03em;
    color:var(--cn-night);background:var(--cn-gold);border:0;border-radius:8px;cursor:pointer;text-align:center;text-decoration:none;
  }
  .cn-btn:hover{filter:brightness(1.06)}
  .cn-btn:disabled{opacity:.6;cursor:default}
  .cn-btn:focus-visible{outline:2px solid var(--cn-ivory);outline-offset:3px}
  .cn-btn-inline{width:auto;margin:0;padding:12px 22px;white-space:nowrap}
  .cn-btn-ghost{background:transparent;color:var(--cn-gold);border:1px solid var(--cn-gold)}
  .cn-btn-ghost:hover{background:var(--cn-gold);color:var(--cn-night)}
  .cn-msg{margin-top:14px;text-align:center;font-size:16px}
  .cn-msg.ok{color:var(--cn-gold)}
  .cn-msg.err{color:#e08a7a}

  .cn-foot{padding:44px 0 20px;text-align:center}
  .cn-foot p{color:var(--cn-ivory-dim);font-size:17px;margin:0 0 6px}
  .cn-foot a{color:var(--cn-ivory);text-decoration:none;border-bottom:1px solid var(--cn-gold)}
  .cn-foot a:hover,.cn-foot a:focus-visible{color:var(--cn-gold)}
`;

function Video({ id, title, sub, alt }: { id: string; title: string; sub: string; alt?: string }) {
  return (
    <div>
      <div className="cn-vid">
        {id ? (
          <iframe
            src={`https://www.youtube.com/embed/${id}`}
            title={alt || title}
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <div className="cn-vid-soon">Coming this week</div>
        )}
      </div>
      <p className="cn-vid-title">{title}</p>
      <p className="cn-vid-sub">{sub}</p>
    </div>
  );
}

export default function CelebrateNilssonPage() {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,340;0,9..144,560;1,9..144,340&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;1,6..72,400&family=Archivo:wght@500;600&display=swap"
        rel="stylesheet"
      />
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      <main>
        <header className="cn-hero">
          <div className="cn-wrap">
            <img
              src="/images/CN_Hero_Smoking_16x9.jpg"
              alt="Celebrate Nilsson — a man in a flat cap lights a cigar against a smoky night street"
            />
            <h1>The songs and story of Harry Nilsson</h1>
            <p className="cn-sub">A live show, presented and performed by Ernie Savage</p>
          </div>
        </header>

        <section className="cn-section" id="shows">
          <div className="cn-wrap">
            <p className="cn-label">Shows</p>
            <NilssonTickets />
          </div>
        </section>

        <section className="cn-section cn-intro">
          <div className="cn-wrap">
            <p>
              Harry Nilsson was one of the most gifted and misunderstood songwriters of the 20th century
              &mdash; celebrated, then overlooked; public, then deeply private. The wild one with the golden
              voice, and behind the chaos, songs that were fragile, tender, and full of sweetness.
            </p>
            <p>
              Celebrate Nilsson is an intimate evening of those songs, the stories behind them, and the man
              himself, presented and performed by singer/songwriter Ernie Savage: solo, on piano, guitar and
              voice. The headlines faded; the magic didn&rsquo;t. This is the heart of Harry, live.
            </p>
          </div>
        </section>

        <section className="cn-section" id="watch">
          <div className="cn-wrap">
            <p className="cn-label">Watch</p>
            <div className="cn-grid3">
              <Video
                id="v_7iWAQnzW4"
                title="Live show highlights"
                sub="Maureen's Jazz Cellar, Nyack — July 2026"
                alt="Celebrate Nilsson — Live Show Highlights"
              />
              <Video
                id={REMEMBER_VIDEO_ID}
                title="Remember (Christmas)"
                sub="Full song, live"
                alt="Remember (Christmas) — Harry Nilsson cover, live"
              />
              <Video
                id="FhMtc1kIJ8A"
                title="Ernie's Harry stories"
                sub="Ernie knew Harry in his Nyack years. An hour of firsthand stories with Frank LoBuono on the Being Frank podcast, with four of Harry's songs played live."
                alt="Harry Nilsson: The Man and His Music — Ernie Savage on Being Frank"
              />
            </div>
          </div>
        </section>

        <section className="cn-section cn-signup" id="signup">
          <div className="cn-wrap">
            <h2>First access to new dates, by email or text</h2>
            <p className="cn-lede">
              January goes on sale to this list first. Leave an email, a mobile number, or both.
            </p>
            <NilssonSignup />
          </div>
        </section>

        <footer className="cn-foot">
          <div className="cn-wrap">
            <p>Presented by Ernie Savage</p>
            <p>
              More shows and booking at <a href="https://www.erniesavage.com">erniesavage.com</a>
            </p>
          </div>
        </footer>
      </main>
    </>
  );
}
