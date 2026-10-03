import type { TeamOutcome } from '@/domain/cricket'

import type { OutcomeSummary } from '../types'

/** Counts the club's wins, losses, ties and no-results; `null` (not played / no club team) is skipped. */
export function summariseOutcomes(outcomes: readonly (TeamOutcome | null)[]): OutcomeSummary {
  const summary: OutcomeSummary = { played: 0, won: 0, lost: 0, tied: 0, noResult: 0 }

  for (const outcome of outcomes) {
    if (outcome === null) {
      continue
    }

    summary.played += 1

    if (outcome === 'won') summary.won += 1
    else if (outcome === 'lost') summary.lost += 1
    else if (outcome === 'tied') summary.tied += 1
    else summary.noResult += 1
  }

  return summary
}

/**
 * Share of decided matches (won, lost or tied) that the club won, between 0 and 1.
 * No-results are excluded, as in league tables. `null` when nothing has been decided yet.
 */
export function calculateWinRate(summary: OutcomeSummary): number | null {
  const decided = summary.won + summary.lost + summary.tied
  return decided === 0 ? null : summary.won / decided
}
