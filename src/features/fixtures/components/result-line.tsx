import { useTranslations } from 'next-intl'

import type { MatchResult } from '@/domain/cricket'

import { describeResult } from '../domain/describe-result'
import type { FixtureTeam } from '../types'

export type ResultLineProps = {
  result: MatchResult<number>
  teams: readonly FixtureTeam[]
}

/** One-line, localised summary such as "NCC-I won by 32 runs" or "Match tied (DLS)". */
export function ResultLine({ result, teams }: ResultLineProps) {
  const t = useTranslations('fixtures.result')

  return <p className="text-sm font-medium">{describeResult(result, teams, t)}</p>
}
