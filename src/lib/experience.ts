export interface ExperienceInfo {
  slug: string;
  title: string;
  subtitle: string;
  cardDesc: string;
  fullDesc: string[];
  image: string;
  color: string;
}

export const experienceData: Record<string, ExperienceInfo> = {
  'secret-ballads': {
    slug: 'secret-ballads',
    title: 'Secret Ballads',
    subtitle: 'An intimate songwriter salon',
    cardDesc:
      'An intimate songwriter salon featuring classic ballads, forgotten gems, and personal stories — performed up close.',
    fullDesc: [
      'An intimate songwriter salon featuring classic ballads, forgotten gems, and personal stories — performed up close, without spectacle. Just piano, guitar, voice, and the songs that deserve to be heard the way they were written.',
      "This is not a concert. It's more like being invited backstage into a songwriter's living room, where every song has a story and every story leads to the next song. Limited to 10 seats. No distractions — just music the way it was meant to be experienced.",
    ],
    image: '/images/secret-ballads.jpg',
    color: '#c4a574',
  },
  'everybody-knows-this-song': {
    slug: 'everybody-knows-this-song',
    title: 'Everybody Knows This Song',
    subtitle: 'The Songs That Lived on the Radio — and Still Live in Us',
    cardDesc:
      "A live, piano-driven journey through the golden age of FM radio: These are songs that didn't just play on the radio — they stayed there. They followed us in cars, kitchens, dorm rooms, and late nights. If you know one, you probably know them all. Everybody knows this song.",
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
      'He was the wild one with the golden voice. But behind the chaos lived songs that were fragile, tender, and full of sweetness. A rare evening of truth, beauty, and melody.',
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
      'Bring an intimate musical experience into your own home or private space. A solo piano/guitar and vocal performance custom curated for any occasion that deserves real music.',
    fullDesc: [
      "Bring an intimate musical experience into your own home or private space. A solo piano/guitar and vocal performance. Custom curated for celebrations, dinner parties, or any occasion that deserves real music, we'll work together to create the perfect experience for you and your guests.",
    ],
    image: '/images/private-concerts.jpg',
    color: '#96784a',
  },
};

export const experienceSlugs = Object.keys(experienceData);
