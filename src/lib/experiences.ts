export interface ExperienceInfo {
  slug: string;
  title: string;
  subtitle: string;
  cardDesc: string;
  cardDesc2?: string;
  cardCta: string;
  fullDesc: string[];
  image: string;
  color: string;
}

export const experienceData: Record<string, ExperienceInfo> = {
  'celebrate-nilsson': {
    slug: 'celebrate-nilsson',
    title: 'Celebrate Nilsson',
    subtitle: 'The songs and story of Harry Nilsson',
    cardDesc:
      'The songs and stories of Harry Nilsson, presented and performed by Ernie Savage, a friend of Harry’s in the 1980s, on piano, guitar and voice.',
    cardCta: 'Buy tickets',
    fullDesc: [
      'Harry Nilsson was one of the most gifted and misunderstood songwriters of the 20th century — celebrated, then overlooked; public, then deeply private. The wild one with the golden voice, and behind the chaos, songs that were fragile, tender, and full of sweetness.',
      'Ernie Savage met Harry Nilsson at nineteen, through his uncle’s restaurant in Nyack, where Harry had become a regular. Harry would drive around with Ernie, listening to demo tapes of Ernie’s songs. One afternoon over a lunch involving a pitcher of martinis, Harry declared, “You have a voice not unlike my own in my younger days...” The show is built on firsthand accounts like that one — encounters, stories, and Harry as Ernie knew him.',
      'Celebrate Nilsson is an intimate evening of Harry’s songs and the stories behind the man himself, presented and performed by singer/songwriter Ernie Savage: solo, on piano, guitar and voice. The headlines faded; the magic didn’t. This is the heart of Harry, live.',
    ],
    image: '/images/CN_Hero_Smoking_16x9.jpg',
    color: '#f2c230',
  },
  'secret-ballads': {
    slug: 'secret-ballads',
    title: 'Secret Ballads',
    subtitle: 'An intimate songwriter salon',
    cardDesc:
      'Sensitive songs — both classic and forgotten — played close enough to be handled with care.',
    cardCta: 'Reserve a Seat',
    fullDesc: [
      'An intimate songwriter salon featuring classic ballads, forgotten gems, and personal stories — performed up close, without spectacle. Just piano, guitar, voice, and the songs that deserve to be heard the way they were written.',
      "This is not a concert. It's more like being invited backstage into a songwriter's living room, where every song has a story and every story leads to the next song. Limited to 10 seats. No distractions — just music the way it was meant to be experienced.",
    ],
    image: '/images/secret-ballads-new.jpg',
    color: '#c4a574',
  },
  'everybody-knows-this-song': {
    slug: 'everybody-knows-this-song',
    title: 'Everybody Knows This Song',
    subtitle: 'The Songs That Lived on the Radio — and Still Live in Us',
    cardDesc:
      "Songs you've lived with for years — heard close enough to feel why they stayed.",
    cardDesc2:
      "These are the songs that followed us in cars, kitchens, dorm rooms, and late nights. In a small room, they land differently.",
    cardCta: 'Reserve a Seat',
    fullDesc: [
      'A live, piano-driven journey through the golden age of FM radio. These are the songs everyone knows — the ones that soundtracked road trips, heartbreaks, and Saturday mornings.',
      "Performed with stories, context, and feeling you won't get from a playlist. These are songs that didn't just play on the radio — they stayed there. They followed us in cars, kitchens, dorm rooms, and late nights. If you know one, you probably know them all.",
    ],
    image: '/images/everybody-knows.png',
    color: '#b8956a',
  },
  'heart-of-harry': {
    slug: 'heart-of-harry',
    title: 'The Heart of Harry',
    subtitle: 'The simple, stunning joy of Harry Nilsson',
    cardDesc:
      'The music of Harry Nilsson — played in the spirit in which it was written: vulnerable, exposed, and without armor.',
    cardDesc2:
      'A small-room piano and voice experience exploring the beauty and fragility beneath the surface.',
    cardCta: 'Reserve a Seat',
    fullDesc: [
      'He was the wild one with the golden voice. But behind the chaos lived songs that were fragile, tender, and full of sweetness.',
      "In this powerful solo performance, Ernie Savage brings Harry Nilsson's most emotional songs back to life — stripped down, reimagined, and deeply felt.",
      'A rare evening of truth, beauty, and melody.',
    ],
    image: '/images/heart-of-harry.jpg',
    color: '#a08050',
  },
  'private-concerts': {
    slug: 'private-concerts',
    title: 'Private & In-Home Concerts',
    subtitle: 'Bring the experience to your space',
    cardDesc:
      'The same small-room experience, hosted in your home or personal space.',
    cardDesc2:
      'For private gatherings, salons, and curated evenings.',
    cardCta: 'Inquire About Hosting',
    fullDesc: [
      "Bring an intimate musical experience into your own home or private space. A solo piano/guitar and vocal performance. Custom curated for celebrations, dinner parties, or any occasion that deserves real music, we'll work together to create the perfect experience for you and your guests.",
    ],
    image: '/images/private-concerts-new.jpg',
    color: '#96784a',
  },
};

export const experienceSlugs = Object.keys(experienceData);
