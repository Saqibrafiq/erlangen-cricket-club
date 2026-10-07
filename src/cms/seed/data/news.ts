/**
 * News articles migrated from the club's previous WordPress site
 * (erlangencricketclub.wordpress.com), with their original publish dates and photos.
 */
import type { SeedNewsArticle } from '../types'
import { NEWS_ARCHIVE } from './news-archive'

const OVB_PROFILE_URL = 'https://www.ovb.de/finanzberater/nuernberg-martin-denis.html'

const NEW_SPONSOR_OVB: SeedNewsArticle = {
  slug: 'new-sponsor-ovb-finanzberater-denis-martin',
  title: 'Erlangen Cricket Club Welcomes New Sponsor: OVB Finanzberater Denis Martin',
  excerpt:
    'We welcome Denis Martin, financial advisor with OVB in Nuremberg, as a new sponsor of Erlangen Cricket Club for the upcoming season.',
  publishedAt: '2025-06-12',
  featuredImage: { file: 'ovb-logo.png', alt: 'OVB logo' },
  featuredImageStyle: 'logo',
  gallery: [],
  body: [
    {
      paragraph: [
        'The Erlangen Cricket Club is proud and excited to announce a fantastic new partnership for the upcoming season! Please join us in extending a very warm welcome to our new sponsor, Denis Martin, a distinguished financial advisor with OVB in Nuremberg.',
      ],
    },
    {
      paragraph: [
        'This sponsorship is a wonderful development for our club, providing vital support that helps us continue to grow the sport of cricket in the Erlangen community. We are incredibly grateful to Denis Martin for his commitment to local sports.',
      ],
    },
    { heading: 'Your Local Expert for Financial Planning' },
    {
      paragraph: [
        'For our members, supporters, and the wider community, Denis Martin offers expert guidance for your financial future. Grounded in the principle of “Your Finances, Your Way,” he provides personalized and trustworthy advice tailored to your unique goals.',
      ],
    },
    { paragraph: ['His services include:'] },
    {
      list: [
        'Comprehensive Financial Analysis: Understanding your personal goals in a relaxed, no-pressure conversation.',
        'Customized Financial Strategies: Building a clear and effective plan that works for you.',
        'Ongoing Support & Service: Regular meetings to ensure your financial plan adapts as your life changes.',
      ],
    },
    {
      paragraph: [
        'With a reputation built on trust and multiple awards for quality service, OVB and Denis Martin are a fantastic resource for anyone looking to secure their financial well-being.',
      ],
    },
    {
      paragraph: [
        'We encourage anyone interested in professional financial planning to connect with him. You can learn more and arrange a consultation through ',
        { text: 'his official profile', href: OVB_PROFILE_URL },
        '.',
      ],
    },
    {
      paragraph: [
        'We are thrilled to embark on this new partnership and look forward to a successful season together. Welcome to the Erlangen Cricket Club family, Denis Martin!',
      ],
    },
  ],
}

const AGM_2024: SeedNewsArticle = {
  slug: 'annual-general-meeting-2024-key-takeaways',
  title:
    'Cricket Passion Shines Through: Key Takeaways from Erlangen Cricket Club’s Annual General Meeting 2024',
  excerpt:
    'Players, members and supporters came together for our Annual General Meeting 2024: a look back at the season, the financial report, awards for our players and the election of new office bearers.',
  publishedAt: '2024-12-19',
  featuredImage: {
    file: 'agm-2024-1.jpg',
    alt: 'Club members seated around tables under a covered, fairy-lit terrace during the Annual General Meeting, with trophies on the table',
  },
  featuredImageStyle: 'photo',
  gallery: [
    { file: 'agm-2024-2.jpg', alt: 'A member seated beside a table lined with gold trophies' },
    {
      file: 'agm-2024-3.jpg',
      alt: 'Members standing and listening during the meeting in the club garden',
    },
    {
      file: 'agm-2024-4.jpg',
      alt: 'Two members smiling on the lit terrace, one holding an award trophy',
    },
    { file: 'agm-2024-5.jpg', alt: 'An award winner holding a trophy next to a club member' },
    {
      file: 'agm-2024-6.jpg',
      alt: 'A player in a white T-shirt receiving a trophy next to a club member',
    },
    {
      file: 'agm-2024-7.jpg',
      alt: 'Members gathered around tables with trophies under the terrace roof',
    },
  ],
  body: [
    {
      paragraph: [
        'Erlangen Cricket Club e.V. recently hosted its highly anticipated Annual General Meeting (AGM), bringing together players, members, and supporters for an evening of reflection, celebration, and forward-thinking. Held at the FIS indoor facility, the event was marked by lively discussions, recognition of key achievements, and a shared enthusiasm for cricket. It was a gathering that emphasized the collective passion and commitment that defines the club.',
      ],
    },
    { heading: 'Reflecting on the Past Year' },
    {
      paragraph: [
        'The AGM began with a thorough recap of the club’s achievements throughout the year. The board and team captains presented updates on the performances of various teams, highlighting both triumphs and challenges faced along the way. Valuable input from members was gathered, ensuring everyone’s voice was heard as the club reflected on its journey.',
      ],
    },
    { heading: 'Gratitude for Support' },
    {
      paragraph: [
        'A key highlight of the AGM was the heartfelt appreciation expressed by the board for the unwavering support the club has received. From players to supporters, volunteers, and sponsors, the board took the opportunity to thank everyone who has contributed to the club’s success. Their dedication, time, and effort have been crucial in helping the club grow and thrive. The board emphasized how each individual’s commitment has helped foster a strong, vibrant cricketing community, and they look forward to continuing this journey together.',
      ],
    },
    { heading: 'Financial Health and Transparency' },
    {
      paragraph: [
        'A major focus of the meeting was the financial well-being of the club. The treasurer delivered an in-depth financial report, covering the club’s income, expenditures, and key investments made throughout the year. This provided members with a clear and transparent overview of how funds were utilized to advance the club’s goals, with opportunities for questions and constructive feedback.',
      ],
    },
    { heading: 'Vision for the Future and Strategic Discussions' },
    {
      paragraph: [
        'The AGM served as a platform for members to present their ideas and motions for the upcoming year. Discussions were centered around player development, enhancing the club’s infrastructure, and increasing community involvement. Members engaged in dynamic brainstorming sessions, offering insightful suggestions that will help steer the club toward continued success.',
      ],
    },
    { heading: 'Celebrating Achievements' },
    {
      paragraph: [
        'In addition to the strategic discussions, the AGM also took a moment to celebrate the club’s outstanding players. Trophies were awarded to individuals who displayed exceptional performance and sportsmanship throughout the year. The atmosphere was filled with pride and appreciation as peers congratulated each other, reinforcing the sense of unity and camaraderie that makes the club so special.',
      ],
    },
    { heading: 'Election of Office Bearers' },
    {
      paragraph: [
        'A key moment of the AGM was the election of new office bearers. Members took part in the democratic process, casting their votes for the president, vice-president, and treasurer who would lead the club through the upcoming year. The newly elected officials expressed their deep gratitude and determination to guide the club toward even greater achievements in the year ahead.',
      ],
    },
    { heading: 'New Leadership' },
    {
      list: [
        'President – Sagar Suri',
        'Vice President – Gursher Singh',
        'Treasurer – Pramod Pujari',
      ],
    },
    {
      paragraph: [
        'The meeting concluded with renewed excitement for the future, as the club prepares for another year of growth, camaraderie, and cricketing success.',
      ],
    },
  ],
}

export const SEED_NEWS: readonly SeedNewsArticle[] = [NEW_SPONSOR_OVB, AGM_2024, ...NEWS_ARCHIVE]
