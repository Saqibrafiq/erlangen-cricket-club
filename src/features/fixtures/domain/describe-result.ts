import type { MatchResult } from '@/domain/cricket'

import type { FixtureTeam } from '../types'

export type ResultMessageKey =
  'won' | 'wonByRuns' | 'wonByWickets' | 'tied' | 'forfeit' | 'walkover' | 'noResult' | 'dlsSuffix'

/** A translator for the `fixtures.result` messages, e.g. next-intl's `t`. */
export type ResultTranslator = (
  key: ResultMessageKey,
  values?: Record<string, string | number>,
) => string

/**
 * One-line, localised summary such as "NCC-I won by 32 runs" or "Match tied (DLS)". Shared by the
 * fixture cards and the Instagram result graphic, so both always say the same.
 */
export function describeResult(
  result: MatchResult<number>,
  teams: readonly FixtureTeam[],
  t: ResultTranslator,
): string {
  const teamName = (id: number) => teams.find((team) => team.id === id)?.name ?? ''

  switch (result.kind) {
    case 'win': {
      const team = teamName(result.winnerTeamId)
      const { margin } = result
      let text = t('won', { team })
      if (margin?.unit === 'runs') text = t('wonByRuns', { team, margin: margin.value })
      if (margin?.unit === 'wickets') text = t('wonByWickets', { team, margin: margin.value })
      return result.isDls ? t('dlsSuffix', { result: text }) : text
    }
    case 'tie':
      return result.isDls ? t('dlsSuffix', { result: t('tied') }) : t('tied')
    case 'forfeit':
      return t('forfeit', { team: teamName(result.winnerTeamId) })
    case 'walkover':
      return t('walkover', { team: teamName(result.winnerTeamId) })
    case 'no-result':
      return t('noResult')
  }
}
