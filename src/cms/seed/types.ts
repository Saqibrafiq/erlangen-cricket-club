import type { ResultMargin } from '../../domain/cricket'
import type { Fixture } from '../../payload-types'

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

export type SeedCompetitionData = {
  competition: SeedCompetition
  fixtures: SeedFixture[]
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
