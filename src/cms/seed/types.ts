import type { ResultMargin } from '../../domain/cricket'
import type { Fixture, News } from '../../payload-types'
import type { SeedBlock } from './rich-text'

export type SeedTeam = {
  shortName: string
  name: string
  isClubTeam?: boolean
}

export type SeedCompetition = {
  name: string
  season: string
  maxOvers: number
}

export type SeedInnings = {
  /** Team short name, e.g. "ECC-I". */
  team: string
  runs: number
  wickets: number
  overs: string
  maxOvers: number
}

export type SeedResult =
  | { method: 'normal' | 'no-result' }
  | { method: 'dls'; winner: string | null; margin?: ResultMargin }
  | { method: 'forfeit' | 'walkover'; winner: string }

/** One row of a published league table; overs in cricket notation. */
export type SeedStandingsRow = {
  /** Team short name, e.g. "ECC-I". */
  team: string
  played: number
  won: number
  lost: number
  noResult: number
  tied: number
  points: number
  winRate: number
  netRunRate: number
  runsFor: number
  oversFaced: string
  runsAgainst: number
  oversBowled: string
}

export type SeedCompetitionData = {
  competition: SeedCompetition
  fixtures: SeedFixture[]
  /** Published table in published order; omitted until the league publishes one. */
  standings?: SeedStandingsRow[]
}

export type SeedFixture = {
  importKey: string
  /** ISO date, YYYY-MM-DD. */
  date: string
  stage: Fixture['stage']
  /** Team short names as listed by the league; defaults to the batting order of `innings`. */
  teams?: [string, string]
  innings: SeedInnings[]
  result: SeedResult
}

/** An image file in `seed/assets/news/` with its alt text. */
export type SeedImage = {
  file: string
  alt: string
}

export type SeedNewsArticle = {
  slug: string
  title: string
  excerpt: string
  /** ISO date, YYYY-MM-DD. */
  publishedAt: string
  featuredImage?: SeedImage
  featuredImageStyle: News['featuredImageStyle']
  gallery: SeedImage[]
  body: SeedBlock[]
}

/** A text in every site locale. */
export type SeedLocalized = Record<'en' | 'de', string>

export type SeedWeekday =
  'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'

export type SeedMembership = {
  /** Filename of an image already in the media library (seeded with the news). */
  heroImage: string
  /** A PDF in `seed/assets/membership/`. */
  applicationForm: { file: string; title: SeedLocalized }
  fees: {
    name: SeedLocalized
    /** One item per line. */
    includes: SeedLocalized
    annualFee: number
    reducedFee?: number
    perMatchFee?: number
    isHighlighted?: boolean
  }[]
  feesNote: SeedLocalized
  terms: SeedLocalized
  sessions: {
    title: SeedLocalized
    days: SeedWeekday[]
    /** HH:mm */
    startTime: string
    endTime: string
    venue: SeedLocalized
  }[]
  sessionsNote: SeedLocalized
}

export type SeedContact = {
  email: string
  facebookUrl: string
  instagramUrl: string
  ground: {
    name: SeedLocalized
    street: string
    postalCode: string
    city: string
    latitude: number
    longitude: number
    directions: SeedLocalized
  }
}
