import { type BattingTotals, type BowlingTotals, isValidOvers, parseOvers } from '@/domain/cricket'
import type { PlayerSeason, Team } from '@/payload-types'

import type { PlayerSeasonRecord, SeasonTeam } from '../types'

type BattingGroup = NonNullable<PlayerSeason['batting']>
type BowlingGroup = NonNullable<PlayerSeason['bowling']>

const orZero = (value: number | null | undefined) => value ?? 0

function mapTeam(team: number | Team | null | undefined): SeasonTeam | null {
  if (typeof team !== 'object' || !team) return null
  return { id: team.id, name: team.name, shortName: team.shortName }
}

/** An empty group (the player did not bat that season) has no matches recorded. */
function mapBatting(group: BattingGroup | null | undefined): BattingTotals | null {
  if (group?.matches === null || group?.matches === undefined) return null

  return {
    matches: group.matches,
    innings: orZero(group.innings),
    notOuts: orZero(group.notOuts),
    runs: orZero(group.runs),
    balls: orZero(group.balls),
    highestScore: orZero(group.highestScore),
    isHighestScoreNotOut: group.isHighestScoreNotOut ?? false,
    hundreds: orZero(group.hundreds),
    fifties: orZero(group.fifties),
    fours: orZero(group.fours),
    sixes: orZero(group.sixes),
  }
}

function mapBowling(group: BowlingGroup | null | undefined): BowlingTotals | null {
  if (group?.matches === null || group?.matches === undefined) return null
  const hasBestFigures =
    group.bestWickets !== null &&
    group.bestWickets !== undefined &&
    group.bestRuns !== null &&
    group.bestRuns !== undefined

  return {
    matches: group.matches,
    innings: orZero(group.innings),
    // The CMS validates the notation; anything else counts as no balls rather than breaking the page.
    balls: group.overs && isValidOvers(group.overs) ? parseOvers(group.overs) : 0,
    maidens: orZero(group.maidens),
    runsConceded: orZero(group.runsConceded),
    wickets: orZero(group.wickets),
    bestFigures: hasBestFigures
      ? { wickets: group.bestWickets ?? 0, runs: group.bestRuns ?? 0 }
      : null,
    dotBalls: orZero(group.dotBalls),
    fourWicketHauls: orZero(group.fourWicketHauls),
    fiveWicketHauls: orZero(group.fiveWicketHauls),
    hatTricks: orZero(group.hatTricks),
    wides: orZero(group.wides),
    noBalls: orZero(group.noBalls),
  }
}

/** Maps a CMS season record to the profile's season row. */
export function mapPlayerSeason(doc: PlayerSeason): PlayerSeasonRecord {
  return {
    id: doc.id,
    season: doc.season,
    competition: doc.competition,
    format: doc.format,
    team: mapTeam(doc.team),
    batting: mapBatting(doc.batting),
    bowling: mapBowling(doc.bowling),
  }
}
