import { useTranslations } from 'next-intl'

import type { MatchResult } from '@/domain/cricket'

import type { FixtureTeam } from '../types'

export type ResultLineProps = {
  result: MatchResult<number>
  teams: readonly FixtureTeam[]
}

/** One-line, localised summary such as "NCC-I won by 32 runs" or "Match tied (DLS)". */
export function ResultLine({ result, teams }: ResultLineProps) {
  const t = useTranslations('fixtures.result')
  const teamName = (id: number) => teams.find((team) => team.id === id)?.name ?? ''

  function describe(): string {
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

  return <p className="text-sm font-medium">{describe()}</p>
}
