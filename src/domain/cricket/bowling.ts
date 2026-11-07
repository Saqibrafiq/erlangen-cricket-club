import { BALLS_PER_OVER } from './overs'

function assertNonNegativeInteger(value: number, name: string): void {
  if (!Number.isInteger(value) || value < 0) {
    throw new RangeError(`${name} must be a non-negative integer, received ${String(value)}`)
  }
}

/** A bowler's best figures in one innings, e.g. 6 wickets for 12 runs ("6/12"). */
export type BowlingFigures = {
  wickets: number
  runs: number
}

/**
 * Bowling average: runs conceded per wicket.
 *
 * @param runsConceded - Runs conceded across all innings.
 * @param wickets - Wickets taken.
 * @returns The average, or `null` when the bowler has not taken a wicket.
 * @throws RangeError if either input is negative or not an integer.
 */
export function calculateBowlingAverage(runsConceded: number, wickets: number): number | null {
  assertNonNegativeInteger(runsConceded, 'runsConceded')
  assertNonNegativeInteger(wickets, 'wickets')

  return wickets === 0 ? null : runsConceded / wickets
}

/**
 * Economy rate: runs conceded per over (six legal balls).
 *
 * @param runsConceded - Runs conceded.
 * @param balls - Legal balls bowled.
 * @returns The economy rate, or `null` when no balls have been bowled.
 * @throws RangeError if either input is negative or not an integer.
 */
export function calculateEconomyRate(runsConceded: number, balls: number): number | null {
  assertNonNegativeInteger(runsConceded, 'runsConceded')
  assertNonNegativeInteger(balls, 'balls')

  return balls === 0 ? null : (runsConceded / balls) * BALLS_PER_OVER
}

/**
 * Bowling strike rate: legal balls bowled per wicket.
 *
 * @param balls - Legal balls bowled.
 * @param wickets - Wickets taken.
 * @returns The strike rate, or `null` when the bowler has not taken a wicket.
 * @throws RangeError if either input is negative or not an integer.
 */
export function calculateBowlingStrikeRate(balls: number, wickets: number): number | null {
  assertNonNegativeInteger(balls, 'balls')
  assertNonNegativeInteger(wickets, 'wickets')

  return wickets === 0 ? null : balls / wickets
}

/**
 * Whether figures `a` are better than `b`: more wickets wins; with equal wickets, fewer runs.
 *
 * @returns `true` only when `a` is strictly better (equal figures are not better).
 */
export function isBetterBowlingFigures(a: BowlingFigures, b: BowlingFigures): boolean {
  if (a.wickets !== b.wickets) {
    return a.wickets > b.wickets
  }
  return a.runs < b.runs
}

/** Formats figures the way scorecards print them: wickets/runs, e.g. `"6/12"`. */
export function formatBowlingFigures({ wickets, runs }: BowlingFigures): string {
  return `${String(wickets)}/${String(runs)}`
}
