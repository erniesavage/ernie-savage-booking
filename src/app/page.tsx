import Link from 'next/link';
import { experienceData } from '@/lib/experiences';

export default function HomePage() {
  const experiences = Object.values(experienceData);

  return (
    <main>
      {/* HERO */}
      <section
        className="hero"
        style={{
          backgroundImage:
            "linear-gradient(180deg, rgba(13,11,9,0.7) 0%, rgba(13,11,9,0.4) 30%, rgba(13,11,9,0.6) 70%, rgba(13,11,9,0.95) 100%), url('/images/hero-bg.jpg')",
        }}
      >
        <div className="hero-content">
          <h1>
            8&ndash;10 People. No Stage.
            <br />
            Real Listening.
          </h1>
          <div className="divider">
            <span className="divider-line" />
            <span>&nbsp;</span>
            <span className="divider-line" />
          </div>
          <p className="hero-main-text">
            Small-room musical experiences in New York City where songs are played up close — and stories are allowed to land.
          </p>
          <p className="hero-main-text" style={{ marginTop: '20px' }}>
            Most live music is designed to keep a distance.
          </p>
          <p className="hero-main-text">
            These gatherings are designed to remove it.
          </p>
          <p className="hero-main-text" style={{ marginTop: '20px' }}>
            A small group sits in a private studio. Songs are played the way they&apos;re usually only played alone — slowly, honestly, without spectacle. There is no stage between you and the music.
          </p>
          <p className="hero-main-text" style={{ marginTop: '20px' }}>
            Seats are limited to 8&ndash;10 guests.
          </p>
          <div style={{ marginTop: '28px' }}>
            <Link href="/#experiences" className="card-link" style={{ fontSize: '16px' }}>Reserve a Seat &rarr;</Link>
          </div>
        </div>
      </section>

      {/* EXPERIENCE CARDS */}
      <section className="experiences" id="experiences">
        <div className="section-title">Choose an Experience</div>
        <div className="cards-grid">
          {experiences.map((exp) => (
            <Link href={`/experience/${exp.slug}`} key={exp.slug} className="card">
              <img src={exp.image} alt={exp.title} className="card-image" />
              <div className="card-content">
                <h3 className="card-title">{exp.title}</h3>
                <p className="card-desc">{exp.cardDesc}</p>
                {exp.cardDesc2 && <p className="card-desc">{exp.cardDesc2}</p>}
                <span className="card-link">{exp.cardCta} &rarr;</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* WHAT TO EXPECT */}
      <section
        className="hero"
        id="expect"
        style={{
          backgroundImage:
            "linear-gradient(180deg, rgba(13,11,9,0.85) 0%, rgba(13,11,9,0.6) 30%, rgba(13,11,9,0.6) 70%, rgba(13,11,9,0.9) 100%), url('/images/what-to-expect-bg.jpg')",
          minHeight: 'auto',
          padding: '60px 24px 120px',
          marginTop: '0',
        }}
      >
        <div className="hero-content">
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '36px', letterSpacing: '0.04em', marginBottom: '40px', color: '#e8dcc8' }}>What to Expect</h2>
          <p className="hero-main-text">8&ndash;10 guests seated in a private NYC studio</p>
          <p className="hero-main-text">75&ndash;90 minutes of live piano/guitar, voice, and story</p>
          <p className="hero-main-text">Songs played without rush or amplification spectacle</p>
          <p className="hero-main-text">Space for silence</p>
          <p className="hero-main-text" style={{ marginTop: '24px' }}>No background noise. No distraction.</p>
          <p className="hero-main-text" style={{ marginTop: '24px' }}>This is not a concert in the traditional sense.</p>
          <p className="hero-main-text">It is a listening experience.</p>
          <div style={{ marginTop: '32px' }}>
            <Link href="/#experiences" className="card-link" style={{ fontSize: '16px' }}>View Upcoming Dates &rarr;</Link>
          </div>
        </div>
      </section>

      {/* WHY IT'S SMALL */}
      <section
        className="hero"
        style={{
          backgroundImage:
            "linear-gradient(180deg, rgba(13,11,9,0.85) 0%, rgba(13,11,9,0.6) 30%, rgba(13,11,9,0.6) 70%, rgba(13,11,9,0.9) 100%), url('/images/why-small-bg.jpg')",
          minHeight: 'auto',
          padding: '120px 24px',
        }}
      >
        <div className="hero-content">
          <p className="hero-main-text">
            This experience is intentionally limited to 8&ndash;10 people because the room changes when it grows larger.
          </p>
          <p className="hero-main-text" style={{ marginTop: '24px' }}>
            Listening changes.<br />
            The music changes.<br />
            The silence matters.
          </p>
          <p className="hero-main-text" style={{ marginTop: '24px' }}>
            If you&apos;re looking for a show, this may not be it.<br />
            If you&apos;re looking to be present in the room while something real happens — it is.
          </p>
          <div style={{ marginTop: '32px' }}>
            <Link href="/#experiences" className="card-link" style={{ fontSize: '16px' }}>Reserve a Seat &rarr;</Link>
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section className="about" id="about">
        <div className="about-content">
          <img src="/images/ernie-about.jpg" alt="Ernie Savage" className="about-image" />
          <div>
            <div className="about-title">About Ernie</div>
            <div className="about-text">
              <p>
                Ernie Savage is a New York&ndash;based musician who has spent a lifetime playing songs up close — in clubs, studios, and rooms where listening actually happens.
              </p>
              <p>
                His work centers on intimacy, storytelling, and the emotional life of songs once the noise falls away.
              </p>
              <p>
                A long-time live performer on piano, guitar, and voice, Ernie has appeared regularly in New York and beyond, and has written and produced music for television and media heard on major broadcast networks.
              </p>
              <p>
                These experiences grew out of a simple observation:
              </p>
              <p style={{ fontStyle: 'italic', color: '#c4a574' }}>
                Some music only works when it&apos;s this close.
              </p>
            </div>
            <div style={{ marginTop: '28px' }}>
              <Link href="/#experiences" className="card-link" style={{ fontSize: '16px' }}>Learn More &amp; Reserve &rarr;</Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
