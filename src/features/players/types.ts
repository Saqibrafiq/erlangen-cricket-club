import type { BattingTotals, BowlingTotals } from '@/domain/cricket'

export type PlayingRole = 'batter' | 'bowler' | 'all-rounder' | 'wicketkeeper'

export type BattingStyle = 'right-hand' | 'left-hand'

export type BowlingStyle =
  | 'right-arm-fast'
  | 'right-arm-medium'
  | 'right-arm-off-spin'
  | 'right-arm-leg-spin'
  | 'left-arm-fast'
  | 'left-arm-medium'
  | 'left-arm-orthodox'
  | 'left-arm-wrist-spin'

export type ClubOffice = 'president' | 'vice-president' | 'treasurer' | 'secretary'

export type PlayerPhoto = {
  url: string
  alt: string
  width: number
  height: number
}

export type PlayerTeam = {
  id: number
  name: string
}

/** A player who agreed to appear on the website. */
export type Player = {
  id: number
  slug: string
  name: string
  photo: PlayerPhoto | null
  playingRole: PlayingRole | null
  battingStyle: BattingStyle | null
  bowlingStyle: BowlingStyle | null
  teams: PlayerTeam[]
  clubOffice: ClubOffice | null
  bio: string | null
  /** Editors pick who stands in the home page's squad line-up. */
  isFeaturedOnHome: boolean
}

/** A club team as season tables show it: the league code (e.g. "ECC-II") with the full name. */
export type SeasonTeam = {
  id: number
  name: string
  shortName: string
}

/** Where a season was played: for the club's teams, or for a district team (not in club totals). */
export type SeasonCompetition = 'club' | 'district'

/**
 * Which matches a record counts: all of them (friendlies too), only the T20 or 50-over leagues, or
 * (`league`) one team's league matches, T20 and 50-over together.
 */
export type SeasonFormat = 'all' | 't20' | 'fifty-over' | 'league'

/** One season of a player's record in one competition and format, as the league published it. */
export type PlayerSeasonRecord = {
  id: number
  season: number
  competition: SeasonCompetition
  format: SeasonFormat
  /** The club team of a per-team record (format `league`); `null` for a whole season. */
  team: SeasonTeam | null
  batting: BattingTotals | null
  bowling: BowlingTotals | null
}
