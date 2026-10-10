import type { FixtureSummary, Matchday } from '@/features/fixtures'
import type { NewsSummary } from '@/features/news'
import type { Player } from '@/features/players'
import type { Sponsor } from '@/features/sponsors'

import type { HomeData } from './types'

/** Test and Storybook data — other features' factories are private to them, so these are local. */
const ECC = { id: 1, name: 'Erlangen Cricket Club I', shortName: 'ECC-I', isClubTeam: true }
const NCC = { id: 2, name: 'NCC-I', shortName: 'NCC-I', isClubTeam: false }
const COMPETITION = {
  id: 1,
  slug: 'bcv-t20-regionalliga-bayern-2027',
  name: 'BCV T20 Regionalliga Bayern',
  season: '2027',
  isFeatured: true,
}

export const NEXT_FIXTURE: FixtureSummary = {
  id: 100,
  date: '2027-05-15T12:00:00.000Z',
  startTime: '11:00',
  venue: 'Erlangen Cricket Ground, Siedlerstraße 1, Erlangen',
  stage: 'league',
  status: 'scheduled',
  competition: COMPETITION,
  teams: [ECC, NCC],
  innings: [],
  result: null,
  clubOutcome: null,
}

export const LATEST_RESULT: FixtureSummary = {
  ...NEXT_FIXTURE,
  id: 50,
  date: '2026-09-05T12:00:00.000Z',
  startTime: null,
  venue: null,
  status: 'completed',
  competition: {
    ...COMPETITION,
    slug: 'bcv-t20-regionalliga-bayern-2026',
    season: '2026',
    isFeatured: false,
  },
  innings: [
    { battingTeamId: 1, runs: 204, wickets: 7, overs: '20', maxOvers: 20 },
    { battingTeamId: 2, runs: 86, wickets: 10, overs: '15.5', maxOvers: 20 },
  ],
  result: { kind: 'win', winnerTeamId: 1, margin: { value: 118, unit: 'runs' }, isDls: false },
  clubOutcome: 'won',
}

const RECORD = { played: 49, won: 27, lost: 20, tied: 0, noResult: 2 }

export const MATCHDAY_WITH_NEXT: Matchday = {
  season: '2027',
  next: NEXT_FIXTURE,
  upcoming: [{ ...NEXT_FIXTURE, id: 101, date: '2027-05-22T12:00:00.000Z', venue: 'Nürnberg' }],
  recentResults: [LATEST_RESULT],
  record: RECORD,
}

export const MATCHDAY_BETWEEN_SEASONS: Matchday = {
  season: '2026',
  next: null,
  upcoming: [],
  recentResults: [LATEST_RESULT],
  record: RECORD,
}

export function makePlayer(
  id: number,
  name: string,
  hasPhoto = true,
  isFeaturedOnHome = false,
): Player {
  const slug = name.toLowerCase().replace(/\s+/g, '-')
  return {
    id,
    slug,
    name,
    photo: hasPhoto
      ? {
          url: `/api/media/file/player-${slug}.webp`,
          alt: `${name} in the club kit`,
          width: 561,
          height: 720,
        }
      : null,
    playingRole: null,
    battingStyle: null,
    bowlingStyle: null,
    teams: [],
    clubOffice: null,
    bio: null,
    isFeaturedOnHome,
  }
}

const NEWS: NewsSummary = {
  id: 1,
  slug: 'season-review-2026',
  title: 'Season review 2026',
  excerpt: 'Two teams, four competitions and a second place in the T20 Regionalliga.',
  publishedAt: '2026-10-01T12:00:00.000Z',
  image: null,
  imageStyle: 'photo',
}

const SPONSOR: Sponsor = {
  id: 1,
  name: 'mein-banker',
  logo: null,
  tier: 'title',
  since: 2024,
  description: 'Personal financial advice.',
  website: null,
  announcementHref: null,
}

export const HOME_DATA: HomeData = {
  matchday: MATCHDAY_WITH_NEXT,
  nextMatch: { calendarHref: '/calendar/fixture-100.ics', kickoff: '2027-05-15T09:00:00.000Z' },
  standings: [],
  clubTeams: 2,
  players: [makePlayer(1, 'Saqib Rafiq'), makePlayer(2, 'Ullas', false)],
  news: [NEWS],
  sponsors: [SPONSOR],
  squadSize: 12,
  instagram: {
    profileUrl: 'https://www.instagram.com/er_cricketclub',
    handle: '@er_cricketclub',
    posts: [
      {
        id: '1',
        imageUrl: 'https://scontent.cdninstagram.com/v/t51/post-1.jpg',
        caption: 'Matchday in Erlangen',
        permalink: 'https://www.instagram.com/p/abc/',
        isVideo: false,
        postedAt: '2026-09-06T18:00:00+0000',
      },
      {
        id: '2',
        imageUrl: 'https://scontent.cdninstagram.com/v/t51/post-2.jpg',
        caption: null,
        permalink: 'https://www.instagram.com/reel/def/',
        isVideo: true,
        postedAt: '2026-09-05T18:00:00+0000',
      },
    ],
  },
  training: {
    weekdayDate: new Date(Date.UTC(2024, 0, 4, 12)),
    startTime: '17:30',
    endTime: '20:00',
  },
}
