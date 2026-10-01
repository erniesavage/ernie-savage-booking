// src/components/PersonJsonLd.tsx — schema.org Person entity for Ernie Savage (erniesavage.com)
// Mirrors Wikidata item Q141592199: occupations, birthplace, citizenship, and external identifiers.

const person = {
  "@context": "https://schema.org",
  "@type": "Person",
  "@id": "https://www.erniesavage.com/#person",
  name: "Ernie Savage",
  url: "https://www.erniesavage.com",
  mainEntityOfPage: "https://www.erniesavage.com",
  image: "https://www.erniesavage.com/images/HP_1_Hero_Image_Piano_and_Room_.jpg",
  jobTitle: "Composer, pianist, guitarist, singer, and songwriter",
  description:
    "Composer, pianist, guitarist, singer, and songwriter from Nyack, New York: television themes, four decades on stage, and Celebrate Nilsson, a concert portrait of Harry Nilsson, with whom Savage was friends in their shared hometown of Nyack, New York.",
  birthPlace: {
    "@type": "Place",
    name: "Nyack, New York",
    sameAs: "https://www.wikidata.org/wiki/Q1816652",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Nyack",
      addressRegion: "NY",
      addressCountry: "US",
    },
  },
  nationality: {
    "@type": "Country",
    name: "United States",
    sameAs: "https://www.wikidata.org/wiki/Q30",
  },
  hasOccupation: [
    {
      "@type": "Occupation",
      name: "Composer",
      sameAs: "https://www.wikidata.org/wiki/Q36834",
    },
    {
      "@type": "Occupation",
      name: "Pianist",
      sameAs: "https://www.wikidata.org/wiki/Q486748",
    },
    {
      "@type": "Occupation",
      name: "Guitarist",
      sameAs: "https://www.wikidata.org/wiki/Q855091",
    },
    {
      "@type": "Occupation",
      name: "Singer-songwriter",
      sameAs: "https://www.wikidata.org/wiki/Q488205",
    },
  ],
  knowsAbout: ["Harry Nilsson", "songwriting", "television music composition", "piano", "guitar"],
  award: "Promax Gold Award, Best Show Theme (2005)",
  affiliation: {
    "@type": "Organization",
    name: "Ernie Savage LLC",
  },
  identifier: [
    {
      "@type": "PropertyValue",
      propertyID: "Wikidata",
      value: "Q141592199",
      url: "https://www.wikidata.org/wiki/Q141592199",
    },
    {
      "@type": "PropertyValue",
      propertyID: "MusicBrainz Artist ID",
      value: "1e34a831-c98a-498b-8851-ed3873c5aac7",
      url: "https://musicbrainz.org/artist/1e34a831-c98a-498b-8851-ed3873c5aac7",
    },
    {
      "@type": "PropertyValue",
      propertyID: "IMDb ID",
      value: "nm2125117",
      url: "https://www.imdb.com/name/nm2125117/",
    },
    {
      "@type": "PropertyValue",
      propertyID: "IPI name number",
      value: "342089667",
    },
    {
      "@type": "PropertyValue",
      propertyID: "IPI name number",
      value: "342089569",
    },
  ],
  sameAs: [
    "https://www.wikidata.org/wiki/Q141592199",
    "https://musicbrainz.org/artist/1e34a831-c98a-498b-8851-ed3873c5aac7",
    "https://www.imdb.com/name/nm2125117/",
    "https://open.spotify.com/artist/5pgnnpkCC6xbKWzUDJUw7R",
    "https://music.apple.com/us/artist/ernie-savage/1587771007",
    "https://www.bandsintown.com/a/15667612",
    "https://www.songkick.com/artists/10416054",
    "https://www.youtube.com/@erniesavageofficial",
    "https://www.facebook.com/profile.php?id=61594510407973",
    "https://www.linkedin.com/in/erniesavage",
    "https://www.celebratenilsson.com",
  ],
};

export default function PersonJsonLd() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(person) }}
    />
  );
}
