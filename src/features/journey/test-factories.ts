import type { JourneyInfo } from './types'

/** Test and Storybook data, from the club's former About page and news archive. */
export const JOURNEY_INFO: JourneyInfo = {
  chapters: [
    {
      title: 'How it all started',
      text: 'Since 2011, cricket has been quietly flourishing in Erlangen, largely unnoticed by most locals.',
    },
    {
      title: 'Our story',
      text: 'Our journey began in 2010 when the first players signed up.',
    },
    {
      title: 'Our approach',
      text: 'We want to be a home for cricketers of all ages and backgrounds.',
    },
  ],
  milestones: [
    {
      year: 2010,
      title: 'The first players sign up',
      text: 'The club starts with one team and around 22 members.',
      image: null,
      link: null,
    },
    {
      year: 2023,
      title: 'Bundesliga champions again',
      text: 'We win the Bavarian Bundesliga and 37 of 52 matches.',
      image: {
        url: '/api/media/file/trophies.jpg',
        alt: 'Two gold trophies won by ECC in 2023',
        width: 1200,
        height: 900,
      },
      link: '/news/the-triumph-of-resilience-eccs-journey-in-2023',
    },
    {
      year: 2026,
      title: 'Two teams, four competitions',
      text: 'ECC-I and ECC-II play in four competitions.',
      image: null,
      link: '/standings',
    },
  ],
}
