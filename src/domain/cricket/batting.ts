/** Strike rate is expressed as runs per 100 balls faced. */
export const STRIKE_RATE_BALLS = 100

function assertNonNegativeInteger(value: number, name: string): void {
  if (!Number.isInteger(value) || value < 0) {
    throw new RangeError(`${name} must be a non-negative integer, received ${String(value)}`)
  }
}

/**
 * Batting average: runs scored per dismissal.
 *
 * @param runs - Total runs scored across all innings.
 * @param dismissals - Innings in which the batter was out (not-out innings are excluded).
 * @returns The average, or `null` when the batter has never been dismissed — cricket
 *   convention leaves the average undefined rather than infinite.
 * @throws RangeError if either input is negative or not an integer.
 */
export function calculateBattingAverage(runs: number, dismissals: number): number | null {
  assertNonNegativeInteger(runs, 'runs')
  assertNonNegativeInteger(dismissals, 'dismissals')

  if (dismissals === 0) {
    return null
  }

  return runs / dismissals
}

/**
 * Batting strike rate: runs scored per 100 balls faced.
 *
 * @param runs - Total runs scored.
 * @param ballsFaced - Legal deliveries faced (wides excluded).
 * @returns The strike rate, or `null` when no balls have been faced.
 * @throws RangeError if either input is negative or not an integer.
 */
export function calculateStrikeRate(runs: number, ballsFaced: number): number | null {
  assertNonNegativeInteger(runs, 'runs')
  assertNonNegativeInteger(ballsFaced, 'ballsFaced')

  if (ballsFaced === 0) {
    return null
  }

  return (runs / ballsFaced) * STRIKE_RATE_BALLS
}
