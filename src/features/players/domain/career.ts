import {
  type BattingTotals,
  type BowlingTotals,
  sumBattingTotals,
  sumBowlingTotals,
} from '@/domain/cricket'

import type { PlayerSeasonRecord, SeasonFormat } from '../types'

/** The formats a visitor can switch between; per-team (\`league\`) records sit inside seasons. */
export type CareerFormat = Exclude<SeasonFormat, 'league'>

/** A player's record as the profile shows it. */
export type CareerSummary = {
  /** The formats the player has club records for, all matches first (e.g. all, T20, 50-over). */
  formats: CareerFormat[]
  /** Whole seasons for the club, newest first. */
  clubSeasons: PlayerSeasonRecord[]
  /** Each team's league record per season (ECC I, II, III), shown inside the all-matches seasons. */
  teamSeasons: PlayerSeasonRecord[]
  /** Seasons for a district team, newest first; not part of the club totals (all matches only). */
  districtSeasons: PlayerSeasonRecord[]
  /** Club career totals; \`null\` when the player never batted (or bowled) for the club. */
  batting: BattingTotals | null
  bowling: BowlingTotals | null
  /** Club matches: per season the larger of the batting and bowling match counts. */
  matches: number
}

const byNewestSeason = (a: PlayerSeasonRecord, b: PlayerSeasonRecord) => b.season - a.season
const byTeam = (a: PlayerSeasonRecord, b: PlayerSeasonRecord) =>
  (a.team?.shortName ?? '').localeCompare(b.team?.shortName ?? '')

/** Matches in a season: a player who bowled but did not bat still played. */
function getSeasonMatches({ batting, bowling }: PlayerSeasonRecord): number {
  return Math.max(batting?.matches ?? 0, bowling?.matches ?? 0)
}

const FORMAT_ORDER: readonly CareerFormat[] = ['all', 't20', 'fifty-over']

/**
 * Splits a player's seasons in one format into club and district and adds up the club career.
 * District seasons and per-team records count all matches, so they belong to the all-matches view
 * only.
 */
export function summarizeCareer(
  seasons: readonly PlayerSeasonRecord[],
  format: CareerFormat = 'all',
): CareerSummary {
  const wholeClubSeasons = seasons.filter(
    (season) => season.competition === 'club' && season.team === null,
  )
  const formats = FORMAT_ORDER.filter((candidate) =>
    wholeClubSeasons.some((season) => season.format === candidate),
  )
  const clubSeasons = wholeClubSeasons
    .filter((season) => season.format === format)
    .sort(byNewestSeason)
  const isAllMatches = format === 'all'
  const teamSeasons = isAllMatches
    ? seasons.filter((season) => season.competition === 'club' && season.team !== null).sort(byTeam)
    : []
  const districtSeasons = isAllMatches
    ? seasons.filter((season) => season.competition === 'district').sort(byNewestSeason)
    : []

  return {
    formats,
    clubSeasons,
    teamSeasons,
    districtSeasons,
    batting: sumBattingTotals(clubSeasons.flatMap(({ batting }) => (batting ? [batting] : []))),
    bowling: sumBowlingTotals(clubSeasons.flatMap(({ bowling }) => (bowling ? [bowling] : []))),
    matches: clubSeasons.reduce((total, season) => total + getSeasonMatches(season), 0),
  }
}
