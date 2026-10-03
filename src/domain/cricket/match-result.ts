/** Identifies a team; callers choose the type (e.g. a database id). */
export type TeamKey = string | number

/** A side batting with all wickets down has lost 10 wickets (11 players). */
export const WICKETS_PER_INNINGS = 10

export type InningsScore<TeamId extends TeamKey = string> = {
  battingTeamId: TeamId
  runs: number
  wickets: number
}

export type ResultMarginUnit = 'runs' | 'wickets'

export type ResultMargin = {
  unit: ResultMarginUnit
  value: number
}

/**
 * How the result was decided: on the field, by Duckworth–Lewis–Stern, by forfeit (a team
 * concedes), by walkover (the opponent does not turn up), or not at all.
 */
export type ResultMethod = 'normal' | 'dls' | 'forfeit' | 'walkover' | 'no-result'

export type ResultInput<TeamId extends TeamKey = string> =
  | { method: 'normal'; innings: readonly InningsScore<TeamId>[] }
  | { method: 'dls'; winnerTeamId: TeamId | null; margin: ResultMargin | null }
  | { method: 'forfeit' | 'walkover'; winnerTeamId: TeamId }
  | { method: 'no-result' }

export type MatchResult<TeamId extends TeamKey = string> =
  | { kind: 'win'; winnerTeamId: TeamId; margin: ResultMargin | null; isDls: boolean }
  | { kind: 'tie'; isDls: boolean }
  | { kind: 'forfeit' | 'walkover'; winnerTeamId: TeamId }
  | { kind: 'no-result' }

function assertValidInnings(innings: InningsScore<TeamKey>): void {
  if (!Number.isInteger(innings.runs) || innings.runs < 0) {
    throw new RangeError(`runs must be a non-negative integer, received ${String(innings.runs)}`)
  }

  if (
    !Number.isInteger(innings.wickets) ||
    innings.wickets < 0 ||
    innings.wickets > WICKETS_PER_INNINGS
  ) {
    throw new RangeError(
      `wickets must be an integer between 0 and ${WICKETS_PER_INNINGS}, received ${String(innings.wickets)}`,
    )
  }
}

function resolveNormalResult<TeamId extends TeamKey>(
  innings: readonly InningsScore<TeamId>[],
): MatchResult<TeamId> {
  const [firstInnings, secondInnings] = innings

  if (innings.length !== 2 || !firstInnings || !secondInnings) {
    throw new RangeError(
      `A completed limited-overs match needs exactly 2 innings, received ${innings.length}`,
    )
  }

  assertValidInnings(firstInnings)
  assertValidInnings(secondInnings)

  if (firstInnings.runs === secondInnings.runs) {
    return { kind: 'tie', isDls: false }
  }

  // Team batting first wins by the run difference; a successful chase wins by wickets in hand.
  if (firstInnings.runs > secondInnings.runs) {
    return {
      kind: 'win',
      winnerTeamId: firstInnings.battingTeamId,
      margin: { unit: 'runs', value: firstInnings.runs - secondInnings.runs },
      isDls: false,
    }
  }

  return {
    kind: 'win',
    winnerTeamId: secondInnings.battingTeamId,
    margin: { unit: 'wickets', value: WICKETS_PER_INNINGS - secondInnings.wickets },
    isDls: false,
  }
}

/**
 * Resolves the result of a completed limited-overs match.
 *
 * For results decided on the field (`normal`), winner and margin are derived from the two
 * innings — never entered by hand. Duckworth–Lewis–Stern results use the officially published
 * winner and margin because revised targets cannot be recomputed from the scores alone; a DLS
 * result without a winner is a tie.
 *
 * @throws RangeError if a normal result does not have exactly two valid innings.
 */
export function resolveMatchResult<TeamId extends TeamKey>(
  input: ResultInput<TeamId>,
): MatchResult<TeamId> {
  switch (input.method) {
    case 'normal':
      return resolveNormalResult(input.innings)
    case 'dls':
      return input.winnerTeamId === null
        ? { kind: 'tie', isDls: true }
        : { kind: 'win', winnerTeamId: input.winnerTeamId, margin: input.margin, isDls: true }
    case 'forfeit':
    case 'walkover':
      return { kind: input.method, winnerTeamId: input.winnerTeamId }
    case 'no-result':
      return { kind: 'no-result' }
  }
}

export type TeamOutcome = 'won' | 'lost' | 'tied' | 'no-result'

/** The match outcome from the perspective of one participating team. */
export function getTeamOutcome<TeamId extends TeamKey>(
  result: MatchResult<TeamId>,
  teamId: TeamId,
): TeamOutcome {
  switch (result.kind) {
    case 'win':
    case 'forfeit':
    case 'walkover':
      return result.winnerTeamId === teamId ? 'won' : 'lost'
    case 'tie':
      return 'tied'
    case 'no-result':
      return 'no-result'
  }
}

/** The winning team for wins, forfeits and walkovers; `null` for ties and no-results. */
export function getWinnerTeamId<TeamId extends TeamKey>(
  result: MatchResult<TeamId>,
): TeamId | null {
  switch (result.kind) {
    case 'win':
    case 'forfeit':
    case 'walkover':
      return result.winnerTeamId
    case 'tie':
    case 'no-result':
      return null
  }
}
