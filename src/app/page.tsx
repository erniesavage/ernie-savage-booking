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
            Intimate Music Experiences.
            <br />
            Timeless Songs.
            <br />
            Real Connection.
          </h1>
          <div className="divider">
            <span className="divider-line" />
            <span>♪</span>
            <span className="divider-line" />
          </div>
          <p className="hero-main-text">
            These experiences are not concerts in the traditional sense. They&apos;re
            gatherings — small, intentional, human — built around songs you know, songs you
            may have forgotten, and stories that remind us why music mattered in the first
            place.
          </p>
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
                <span className="card-link">Explore & Book</span>
              </div>
            </Link>
          ))}
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
                From Rockland Lake, New York. A live performer — guitar, keyboard, and vocals
                — as a solo act, all the way up through fronting his 10-piece Blues/Jazz/R&amp;B
                band which regularly performed on corporate dates, festival stages, and seated
                events throughout the US.
              </p>
              <p>
                Long-standing weekly engagements at{' '}
                <strong>The Carnegie Club on West 56th Street in New York City</strong> and{' '}
                <strong>Sambuca Jazz Club at the Rice Hotel in Houston</strong>. Performed at
                Bob Hope&apos;s 100th birthday celebration in May of 2003.
              </p>
              <p>
                A composer and producer, Ernie has written and produced themes, scores, and
                network IDs for NBC, PBS, ABC, Lifetime, Food Network, PBS Kids, and
                Nickelodeon — including the theme to the{' '}
                <em>NBC Early Today Show</em>.
              </p>
              <p>
                Recipient of the <strong>ProMax Gold Award</strong> for &quot;Best Show Theme
                and Promo Package: Network and Cable.&quot;
              </p>
            </div>
            <div className="quote-block">
              <p className="quote-text">
                &quot;I think he&apos;s been recognized as a genius, rightfully so... The
                beauty of his songs are in the juxtaposition of the beauty and the darkness.
                He&apos;s like the boy next door, who secretly is a super hero!&quot;
              </p>
              <p className="quote-attr">— @SRMerola, YouTube</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
