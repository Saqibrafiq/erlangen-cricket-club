import {
  type InningsScore,
  type MatchResult,
  resolveMatchResult,
  type ResultInput,
} from '@/domain/cricket'
import type { Fixture } from '@/payload-types'

/** The stored fields a result is derived from; relations may be ids or populated documents. */
export type FixtureResultSource = Partial<Pick<Fixture, 'id' | 'status' | 'innings' | 'result'>>

/** Thrown when a completed fixture is stored without what its result needs (programming error). */
export class FixtureResultError extends Error {
  override name = 'FixtureResultError'
}

export function relationId(value: number | { id: number } | null | undefined): number | null {
  if (value === null || value === undefined) return null
  return typeof value === 'number' ? value : value.id
}

function toInningsScores(doc: FixtureResultSource): InningsScore<number>[] {
  return (doc.innings ?? []).map((innings) => {
    const battingTeamId = relationId(innings.battingTeam)
    if (battingTeamId === null) {
      throw new FixtureResultError(`Fixture ${String(doc.id)}: innings without batting team`)
    }
    return { battingTeamId, runs: innings.runs, wickets: innings.wickets }
  })
}

function toResultInput(doc: FixtureResultSource): ResultInput<number> {
  const { method = 'normal', winner, marginValue, marginUnit } = doc.result ?? {}
  const winnerTeamId = relationId(winner)

  switch (method) {
    case 'normal':
      return { method, innings: toInningsScores(doc) }
    case 'dls': {
      const margin =
        typeof marginValue === 'number' && marginUnit
          ? { value: marginValue, unit: marginUnit }
          : null
      return { method, winnerTeamId, margin }
    }
    case 'forfeit':
    case 'walkover':
      if (winnerTeamId === null) {
        throw new FixtureResultError(`Fixture ${String(doc.id)}: ${method} without winner`)
      }
      return { method, winnerTeamId }
    case 'no-result':
      return { method }
  }
}

/**
 * A fixture's result, derived from the stored innings and result group (never entered by hand),
 * or `null` until the fixture is completed. The website's fixture pages and the members' app both
 * read it from here, so they always state the same result.
 */
export function getFixtureResult(doc: FixtureResultSource): MatchResult<number> | null {
  return doc.status === 'completed' ? resolveMatchResult(toResultInput(doc)) : null
}
