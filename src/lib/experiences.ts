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
      'The songs and stories of Harry Nilsson, presented and performed by Ernie Savage, who was friends with Harry in their shared hometown of Nyack, New York, on piano, guitar and voice.',
    cardCta: 'Buy tickets',
    fullDesc: [
      'Harry Nilsson was one of the most gifted and misunderstood songwriters of the 20th century — celebrated, then overlooked; public, then deeply private. The wild one with the golden voice, and behind the chaos, songs that were fragile, tender, and full of sweetness.',
      'Ernie Savage met Harry Nilsson at nineteen, through his uncle’s restaurant in Nyack, New York, where Harry had become a regular. Harry would drive around with Ernie, listening to demo tapes of Ernie’s songs. One afternoon over a lunch involving a pitcher of martinis, Harry declared, “You have a voice not unlike my own in my younger days...” The show is built on firsthand accounts like that one — encounters, stories, and Harry as Ernie knew him.',
      'Celebrate Nilsson is an intimate evening of Harry’s songs and the stories behind the man himself, presented and performed by singer/songwriter Ernie Savage: solo, on piano, guitar and voice. The headlines faded; the magic didn’t. This is the heart of Harry, live.',
    ],
    image: '/images/CN_Hero_Smoking_16x9.jpg',
    color: '#f2c230',
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
