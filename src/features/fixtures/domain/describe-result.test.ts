import { describe, expect, it } from 'vitest'

import type { MatchResult } from '@/domain/cricket'

import { ECC_TEAM, NCC_TEAM } from '../test-factories'
import { describeResult, type ResultTranslator } from './describe-result'

// Echoes key and values, so each test sees exactly which message was chosen.
const t: ResultTranslator = (key, values) =>
  values ? `${key}(${Object.values(values).join(',')})` : key

const TEAMS = [ECC_TEAM, NCC_TEAM] as const

function describeAs(result: MatchResult<number>): string {
  return describeResult(result, TEAMS, t)
}

describe('describeResult', () => {
  it('names the winner and the margin in runs or wickets', () => {
    expect(
      describeAs({
        kind: 'win',
        winnerTeamId: 1,
        margin: { value: 32, unit: 'runs' },
        isDls: false,
      }),
    ).toBe('wonByRuns(Erlangen Cricket Club I,32)')
    expect(
      describeAs({
        kind: 'win',
        winnerTeamId: 2,
        margin: { value: 4, unit: 'wickets' },
        isDls: false,
      }),
    ).toBe('wonByWickets(NCC-I,4)')
  })

  it('names the winner alone when there is no margin, and marks DLS', () => {
    expect(describeAs({ kind: 'win', winnerTeamId: 2, margin: null, isDls: true })).toBe(
      'dlsSuffix(won(NCC-I))',
    )
  })

  it('describes ties, with and without DLS', () => {
    expect(describeAs({ kind: 'tie', isDls: false })).toBe('tied')
    expect(describeAs({ kind: 'tie', isDls: true })).toBe('dlsSuffix(tied)')
  })

  it('describes forfeits, walkovers and no results', () => {
    expect(describeAs({ kind: 'forfeit', winnerTeamId: 1 })).toBe(
      'forfeit(Erlangen Cricket Club I)',
    )
    expect(describeAs({ kind: 'walkover', winnerTeamId: 2 })).toBe('walkover(NCC-I)')
    expect(describeAs({ kind: 'no-result' })).toBe('noResult')
  })

  it('leaves the team name empty for an unknown team', () => {
    expect(describeAs({ kind: 'forfeit', winnerTeamId: 99 })).toBe('forfeit()')
  })
})
