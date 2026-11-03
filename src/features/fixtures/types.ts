import type { MatchResult, TeamOutcome } from '@/domain/cricket'

export type FixtureStage = 'league' | 'qualifier' | 'semi-final' | 'final'

export type FixtureStatus = 'scheduled' | 'completed' | 'abandoned' | 'cancelled'

export type FixtureTeam = {
  id: number
  name: string
  shortName: string
  isClubTeam: boolean
}

export type FixtureCompetition = {
  id: number
  slug: string
  name: string
  season: string
  /** Its next match is the one the home page counts down to. */
  isFeatured: boolean
}

/** Where a match is played; the address is for directions and calendars. */
export type FixtureGround = {
  name: string
  address: string | null
}

export type FixtureInnings = {
  battingTeamId: number
  runs: number
  wickets: number
  overs: string
  maxOvers: number
}

export type FixtureSummary = {
  id: number
  /** ISO 8601 date-time; day-only fixtures are stored at noon UTC. */
  date: string
  startTime: string | null
  ground: FixtureGround | null
  stage: FixtureStage
  status: FixtureStatus
  competition: FixtureCompetition
  /** The two teams as listed by the league (batting order for completed matches). */
  teams: readonly [FixtureTeam, FixtureTeam]
  innings: readonly FixtureInnings[]
  result: MatchResult<number> | null
  /** Outcome for the Erlangen team taking part, if any. */
  clubOutcome: TeamOutcome | null
}

export type OutcomeSummary = {
  played: number
  won: number
  lost: number
  tied: number
  noResult: number
}

/** A competition with the club teams taking part (derived from its fixtures) and their record. */
export type CompetitionSummary = {
  competition: FixtureCompetition
  clubTeams: readonly FixtureTeam[]
  record: OutcomeSummary
}

/** Fixtures in display order: upcoming (soonest first), then the rest (newest first). */
export type FixturesOverview = {
  fixtures: readonly FixtureSummary[]
  /** Every competition with fixtures, grouped by club team — the competition filter's options. */
  competitionsByTeam: readonly TeamCompetitions[]
}

/** One season's fixtures, with every season for the switcher. */
export type FixturesSeason = FixturesOverview & {
  /** The season shown; `null` without competitions (or for an unknown season). */
  season: string | null
  /** Newest first. */
  seasons: string[]
  isCurrent: boolean
}

/** Everything shown on one competition's page. */
export type CompetitionDetail = CompetitionSummary & {
  /** Upcoming (soonest first), then the rest (newest first). */
  fixtures: readonly FixtureSummary[]
}

export type TeamCompetitions = {
  team: FixtureTeam
  competitions: readonly FixtureCompetition[]
}

/** Competitions of the latest season, grouped by club team, for site navigation. */
export type CompetitionNavigation = {
  season: string
  teams: readonly TeamCompetitions[]
}
