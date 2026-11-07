import { type BowlingFigures, isBetterBowlingFigures } from './bowling'

/** A batter's record over a stretch of matches (a season, or a whole career). */
export type BattingTotals = {
  matches: number
  innings: number
  notOuts: number
  runs: number
  /** Legal balls faced. */
  balls: number
  highestScore: number
  isHighestScoreNotOut: boolean
  hundreds: number
  fifties: number
  fours: number
  sixes: number
}

/** A bowler's record over a stretch of matches (a season, or a whole career). */
export type BowlingTotals = {
  matches: number
  innings: number
  /** Legal balls bowled (overs × 6 + extra balls). */
  balls: number
  maidens: number
  runsConceded: number
  wickets: number
  /** Best figures in one innings; `null` when unknown. */
  bestFigures: BowlingFigures | null
  dotBalls: number
  fourWicketHauls: number
  fiveWicketHauls: number
  hatTricks: number
  wides: number
  noBalls: number
}

/** Batting dismissals: innings minus not-outs (never negative). */
export function getDismissals({ innings, notOuts }: Pick<BattingTotals, 'innings' | 'notOuts'>) {
  return Math.max(innings - notOuts, 0)
}

/** Whether `a` is a higher score than `b`; on equal runs, a not-out score counts higher. */
function isHigherScore(a: BattingTotals, b: BattingTotals): boolean {
  if (a.highestScore !== b.highestScore) {
    return a.highestScore > b.highestScore
  }
  return a.isHighestScoreNotOut && !b.isHighestScoreNotOut
}

function pickBestFigures(
  current: BowlingFigures | null,
  next: BowlingFigures | null,
): BowlingFigures | null {
  if (!current) return next
  if (!next) return current
  return isBetterBowlingFigures(next, current) ? next : current
}

/**
 * Adds up batting records (e.g. seasons into a career): counts are summed, the highest score is
 * the best single score.
 *
 * @returns The combined record, or `null` when there is nothing to add up.
 */
export function sumBattingTotals(records: readonly BattingTotals[]): BattingTotals | null {
  const [first, ...rest] = records
  if (!first) return null

  return rest.reduce<BattingTotals>((total, record) => {
    const best = isHigherScore(record, total) ? record : total
    return {
      matches: total.matches + record.matches,
      innings: total.innings + record.innings,
      notOuts: total.notOuts + record.notOuts,
      runs: total.runs + record.runs,
      balls: total.balls + record.balls,
      highestScore: best.highestScore,
      isHighestScoreNotOut: best.isHighestScoreNotOut,
      hundreds: total.hundreds + record.hundreds,
      fifties: total.fifties + record.fifties,
      fours: total.fours + record.fours,
      sixes: total.sixes + record.sixes,
    }
  }, first)
}

/**
 * Adds up bowling records (e.g. seasons into a career): counts are summed, the best figures are
 * the best single innings (most wickets, then fewest runs).
 *
 * @returns The combined record, or `null` when there is nothing to add up.
 */
export function sumBowlingTotals(records: readonly BowlingTotals[]): BowlingTotals | null {
  const [first, ...rest] = records
  if (!first) return null

  return rest.reduce<BowlingTotals>(
    (total, record) => ({
      matches: total.matches + record.matches,
      innings: total.innings + record.innings,
      balls: total.balls + record.balls,
      maidens: total.maidens + record.maidens,
      runsConceded: total.runsConceded + record.runsConceded,
      wickets: total.wickets + record.wickets,
      bestFigures: pickBestFigures(total.bestFigures, record.bestFigures),
      dotBalls: total.dotBalls + record.dotBalls,
      fourWicketHauls: total.fourWicketHauls + record.fourWicketHauls,
      fiveWicketHauls: total.fiveWicketHauls + record.fiveWicketHauls,
      hatTricks: total.hatTricks + record.hatTricks,
      wides: total.wides + record.wides,
      noBalls: total.noBalls + record.noBalls,
    }),
    first,
  )
}

/** Batting counts without the best single score, which cannot be split (e.g. a remainder). */
export type BattingCounts = Omit<BattingTotals, 'highestScore' | 'isHighestScoreNotOut'>

/** Bowling counts without the best figures, which cannot be split (e.g. a remainder). */
export type BowlingCounts = Omit<BowlingTotals, 'bestFigures'>

const BATTING_COUNT_KEYS = [
  'matches',
  'innings',
  'notOuts',
  'runs',
  'balls',
  'hundreds',
  'fifties',
  'fours',
  'sixes',
] as const satisfies readonly (keyof BattingCounts)[]

const BOWLING_COUNT_KEYS = [
  'matches',
  'innings',
  'balls',
  'maidens',
  'runsConceded',
  'wickets',
  'dotBalls',
  'fourWicketHauls',
  'fiveWicketHauls',
  'hatTricks',
  'wides',
  'noBalls',
] as const satisfies readonly (keyof BowlingCounts)[]

function subtractCounts<K extends string>(
  keys: readonly K[],
  /**
   * The count that must stay above zero for anything to be left: innings, as matches without an
   * innings (e.g. batted but did not bowl) carry no figures.
   */
  leadKey: K,
  whole: Record<K, number>,
  parts: readonly Record<K, number>[],
): Record<K, number> | null {
  const remainder = Object.fromEntries(
    keys.map((key) => [key, parts.reduce((left, part) => left - part[key], whole[key])]),
  ) as Record<K, number>
  const isConsistent = keys.every((key) => remainder[key] >= 0)
  return isConsistent && remainder[leadKey] > 0 ? remainder : null
}

/**
 * What is left of a season's batting after taking out its parts, e.g. the matches outside the
 * league (friendlies) once every team's league record is taken out of the season total.
 *
 * @returns The remaining counts, or `null` when no innings are left or the parts add up to more
 *   than the whole (inconsistent records).
 */
export function subtractBattingTotals(
  whole: BattingTotals,
  parts: readonly BattingTotals[],
): BattingCounts | null {
  return subtractCounts(BATTING_COUNT_KEYS, 'innings', whole, parts)
}

/**
 * What is left of a season's bowling after taking out its parts (see {@link subtractBattingTotals}).
 *
 * @returns The remaining counts, or `null` when nothing is left or the parts add up to more
 *   than the whole.
 */
export function subtractBowlingTotals(
  whole: BowlingTotals,
  parts: readonly BowlingTotals[],
): BowlingCounts | null {
  return subtractCounts(BOWLING_COUNT_KEYS, 'innings', whole, parts)
}
