export const BALLS_PER_OVER = 6

const OVERS_PATTERN = /^(\d+)(?:\.([0-5]))?$/

/**
 * Converts cricket overs notation to legal balls bowled.
 *
 * In "19.2" the digit after the dot counts balls (0–5), not tenths of an over.
 *
 * @param overs - Overs in cricket notation, e.g. `"20"`, `"19.2"`.
 * @returns The number of legal balls, e.g. `116` for `"19.2"`.
 * @throws RangeError if `overs` is not valid cricket notation.
 */
export function parseOvers(overs: string): number {
  const match = OVERS_PATTERN.exec(overs.trim())

  if (!match) {
    throw new RangeError(`Invalid overs "${overs}": expected e.g. "20" or "19.2"`)
  }

  const [, completeOvers = '0', extraBalls = '0'] = match
  return Number(completeOvers) * BALLS_PER_OVER + Number(extraBalls)
}

/** Returns `true` when `overs` is valid cricket notation (see {@link parseOvers}). */
export function isValidOvers(overs: string): boolean {
  return OVERS_PATTERN.test(overs.trim())
}

/**
 * Formats legal balls bowled as cricket overs notation.
 *
 * @param balls - Non-negative integer number of legal balls.
 * @returns Overs notation, e.g. `"19.2"` for `116`, `"20"` for `120`.
 * @throws RangeError if `balls` is negative or not an integer.
 */
export function formatOvers(balls: number): string {
  if (!Number.isInteger(balls) || balls < 0) {
    throw new RangeError(`balls must be a non-negative integer, received ${String(balls)}`)
  }

  const completeOvers = Math.floor(balls / BALLS_PER_OVER)
  const extraBalls = balls % BALLS_PER_OVER

  return extraBalls === 0 ? String(completeOvers) : `${completeOvers}.${extraBalls}`
}
