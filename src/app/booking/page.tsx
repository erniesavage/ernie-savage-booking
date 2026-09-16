// src/app/booking/page.tsx — Bring Celebrate Nilsson to your room
import BookingForm from '../../components/BookingForm';

export const metadata = {
  title: 'Book Celebrate Nilsson',
  description:
    'Bring Celebrate Nilsson to your room — listening rooms and theaters, house concerts and private events, corporate and special events. One performer, piano and guitar.',
  alternates: { canonical: 'https://celebratenilsson.com/booking' },
  openGraph: {
    title: 'Book Celebrate Nilsson',
    description: 'One performer, piano and guitar, seventy-five to ninety minutes. Listening rooms, house concerts, corporate evenings.',
    url: 'https://celebratenilsson.com/booking',
    siteName: 'Celebrate Nilsson',
    type: 'website',
    images: [{ url: 'https://www.erniesavage.com/images/CN_OG_1200x630.jpg', width: 1200, height: 630, alt: 'Celebrate Nilsson' }],
  },
};

const CSS = `
  :root{--cn-night:#121110;--cn-night-2:#1c1916;--cn-ivory:#efe7d5;--cn-ivory-dim:#c4b9a3;--cn-gold:#f2c230;--cn-hairline:rgba(242,194,48,.26)}
  body{background:var(--cn-night);color:var(--cn-ivory);font-family:"Newsreader",Georgia,serif;font-size:19px;line-height:1.65;-webkit-font-smoothing:antialiased}
  .cn-wrap{max-width:820px;margin:0 auto;padding:0 24px}
  .bk-head{padding:44px 0 8px}
  .bk-head h1{font-family:"Fraunces",serif;font-weight:340;font-size:clamp(30px,4.6vw,46px);line-height:1.1;margin:0 0 16px}
  .bk-head p{font-size:clamp(19px,2.2vw,22px);line-height:1.6;max-width:62ch;margin:0}
  .bk-section{padding:34px 0;border-bottom:1px solid var(--cn-hairline)}
  .bk-section h2{font-family:"Fraunces",serif;font-weight:560;font-size:clamp(22px,2.8vw,27px);margin:0 0 10px}
  .bk-section p{max-width:64ch;margin:0}
  .bk-form-head{padding:40px 0 0}
  .bk-form-head h2{font-family:"Fraunces",serif;font-weight:340;font-size:clamp(26px,3.6vw,36px);margin:0 0 6px;text-align:center}
  .bk-form-head p{text-align:center;color:var(--cn-ivory-dim);font-size:17px;margin:0 0 26px}
  .bk-after{text-align:center;color:var(--cn-ivory-dim);font-size:16px;line-height:1.6;max-width:56ch;margin:26px auto 0}
  .bk-after a{color:var(--cn-ivory);text-decoration:none;border-bottom:1px solid var(--cn-gold)}
  .bk-after a:hover{color:var(--cn-gold)}
  .cn-form{max-width:520px;margin:0 auto}
  .cn-field{margin-bottom:16px}
  .cn-field label{display:block;font-family:"Archivo",sans-serif;font-size:14px;color:var(--cn-ivory-dim);margin-bottom:6px}
  .cn-field input[type=text],.cn-field input[type=email],.cn-field select,.cn-field textarea{
    width:100%;font-family:"Newsreader",Georgia,serif;font-size:18px;color:var(--cn-ivory);
    background:var(--cn-night-2);border:1px solid var(--cn-hairline);border-radius:6px;padding:11px 14px;}
  .cn-field textarea{resize:vertical}
  .cn-field input:focus-visible,.cn-field select:focus-visible,.cn-field textarea:focus-visible{outline:2px solid var(--cn-gold);outline-offset:2px}
  .cn-btn{display:block;width:100%;margin-top:18px;padding:14px 22px;font-family:"Archivo",sans-serif;font-weight:600;font-size:16px;letter-spacing:.03em;color:var(--cn-night);background:var(--cn-gold);border:0;border-radius:8px;cursor:pointer}
  .cn-btn:hover{filter:brightness(1.06)} .cn-btn:disabled{opacity:.6;cursor:default}
  .cn-msg{margin-top:14px;text-align:center;font-size:17px} .cn-msg.ok{color:var(--cn-gold)} .cn-msg.err{color:#e08a7a}
  .bk-foot{padding:44px 0 20px;text-align:center;color:var(--cn-ivory-dim);font-size:17px}
  .bk-foot a{color:var(--cn-ivory);text-decoration:none;border-bottom:1px solid var(--cn-gold)}
`;

export default function BookingPage() {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,340;0,9..144,560;1,9..144,340&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;1,6..72,400&family=Archivo:wght@500;600&display=swap" rel="stylesheet" />
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <main>
        <header className="bk-head">
          <div className="cn-wrap">
            <h1>Bring Celebrate Nilsson to your room</h1>
            <p>
              Celebrate Nilsson travels light: one performer, piano and guitar, seventy-five to ninety minutes,
              no band. It has played a jazz cellar, a private studio, and a room full of songwriters after
              midnight, and it fits anywhere an audience can go quiet for a ballad and loud for &ldquo;Coconut.&rdquo;
            </p>
          </div>
        </header>

        <section className="bk-section"><div className="cn-wrap">
          <h2>Listening rooms &amp; theaters</h2>
          <p>Built for the room where people come to listen. A full evening &mdash; the songs, the stories behind them, and the man himself &mdash; as one seventy-five-minute set or two sets with a break. Story-driven and singalong-ready; the audience leaves knowing Harry better than when they walked in. Available as a headline evening or paired with a guest artist for a double bill.</p>
        </div></section>

        <section className="bk-section"><div className="cn-wrap">
          <h2>House concerts &amp; private events</h2>
          <p>The show was born in small rooms, and it&rsquo;s still best in one. Twenty to forty guests, a piano or keyboard, and a host who wants an evening people talk about afterward. Most hosts ask guests for $25 to $35, and the evening pays for itself. Ideal for a birthday, an anniversary, or a gathering of people who grew up on these songs.</p>
        </div></section>

        <section className="bk-section"><div className="cn-wrap">
          <h2>Corporate &amp; special events</h2>
          <p>Audiences who don&rsquo;t know Nilsson&rsquo;s name know his songs; by the end of the evening they realize it was him all along. Works as an after-dinner set, a themed evening, or a seventy-five-minute program with a Q&amp;A, from a performer with four decades on stages from the Carnegie Club to network television.</p>
        </div></section>

        <section className="bk-form-head" id="inquire"><div className="cn-wrap">
          <h2>Tell us about your date</h2>
          <p>A minute to fill in. The riders come back to you automatically.</p>
          <BookingForm />
          <p className="bk-after">
            Fees vary by format, room, and distance; you&rsquo;ll have a clear quote back, usually the same day, with the
            technical and hospitality riders attached. Prefer email? <a href="mailto:booking@erniesavage.com">booking@erniesavage.com</a>
          </p>
        </div></section>

        <footer className="bk-foot"><div className="cn-wrap">
          <p>Presented by <a href="https://www.erniesavage.com/#about">Ernie Savage</a></p>
        </div></footer>
      </main>
    </>
  );
}
