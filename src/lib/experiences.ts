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
    subtitle: 'An after-hours songwriter salon',
    cardDesc:
      'An intimate songwriter salon featuring classic ballads, forgotten gems, and personal stories — performed up close.',
    fullDesc: [
      'An after-hours songwriter salon featuring classic ballads, forgotten gems, and personal stories — performed up close, without spectacle. Just piano, voice, and the songs that deserve to be heard the way they were written.',
      'This is not a concert. It\'s more like being invited backstage into a songwriter\'s living room, where every song has a story and every story leads to the next song. Limited to 10 seats. No phones, no distractions — just music the way it was meant to be experienced.',
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
    subtitle: 'The Music and Inner Life of Harry Nilsson',
    cardDesc:
      'A deeply intimate solo piano and voice journey through the music and inner life of Harry Nilsson — focusing on beauty, vulnerability, and the songs he wrote when the spotlight faded and the truth emerged.',
    fullDesc: [
      'A deeply intimate solo piano and voice journey through the music and inner life of Harry Nilsson — focusing on the beauty, vulnerability, and songs he wrote when the spotlight faded.',
      'For anyone who ever felt that "Without You" was just the beginning. This experience explores the deeper Nilsson — the songwriter\'s songwriter whose work reveals more with every listen.',
    ],
    image: '/images/heart-of-harry.jpg',
    color: '#a08050',
  },
  'private-concerts': {
    slug: 'private-concerts',
    title: 'Private & In-Home Concerts',
    subtitle: 'Bring the experience to your space',
    cardDesc:
      'Bring one of these experiences — or a curated set of classic FM-era songwriter favorites — into your own home, loft, or private space.',
    fullDesc: [
      'Bring one of these experiences — or a curated set of classic FM-era songwriter favorites — into your own home, loft, or private space.',
      'Perfect for birthdays, anniversaries, dinner parties, or any night that deserves real music. We\'ll work together to create the perfect evening for you and your guests.',
    ],
    image: '/images/private-concerts.jpg',
    color: '#96784a',
  },
};

export const experienceSlugs = Object.keys(experienceData);
