import { describe, expect, it } from 'vitest'

import { FixtureResultError, getFixtureResult, relationId } from './fixture-result'

const PLAYED = {
  id: 10,
  status: 'completed' as const,
  innings: [
    { battingTeam: 2, runs: 236, wickets: 5, overs: '20', maxOvers: 20 },
    { battingTeam: { id: 1 } as never, runs: 204, wickets: 10, overs: '19.2', maxOvers: 20 },
  ],
}

describe('getFixtureResult', () => {
  it('derives a result decided on the field from the innings', () => {
    expect(getFixtureResult({ ...PLAYED, result: { method: 'normal' } })).toEqual({
      kind: 'win',
      winnerTeamId: 2,
      margin: { unit: 'runs', value: 32 },
      isDls: false,
    })
  })

  it('treats a missing result group as decided on the field', () => {
    expect(getFixtureResult(PLAYED)).toMatchObject({ kind: 'win', winnerTeamId: 2 })
  })

  it('uses the published winner and margin for DLS, and a tie without a winner', () => {
    expect(
      getFixtureResult({
        ...PLAYED,
        result: { method: 'dls', winner: 1, marginValue: 4, marginUnit: 'wickets' },
      }),
    ).toEqual({
      kind: 'win',
      winnerTeamId: 1,
      margin: { unit: 'wickets', value: 4 },
      isDls: true,
    })
    expect(getFixtureResult({ ...PLAYED, result: { method: 'dls', winner: 1 } })).toMatchObject({
      margin: null,
    })
    expect(getFixtureResult({ ...PLAYED, result: { method: 'dls', winner: null } })).toEqual({
      kind: 'tie',
      isDls: true,
    })
  })

  it('awards forfeits and walkovers, and records a no result', () => {
    expect(getFixtureResult({ ...PLAYED, result: { method: 'walkover', winner: 1 } })).toEqual({
      kind: 'walkover',
      winnerTeamId: 1,
    })
    expect(getFixtureResult({ ...PLAYED, result: { method: 'no-result' } })).toEqual({
      kind: 'no-result',
    })
  })

  it('has no result before the fixture is completed', () => {
    for (const status of ['scheduled', 'abandoned', 'cancelled', undefined] as const) {
      expect(getFixtureResult({ ...PLAYED, status })).toBeNull()
    }
  })

  it('refuses a completed fixture stored without its innings', () => {
    expect(() => getFixtureResult({ id: 10, status: 'completed' })).toThrow(RangeError)
  })

  it('throws for an award without a winner or an innings without a batting team', () => {
    expect(() =>
      getFixtureResult({ ...PLAYED, result: { method: 'forfeit', winner: null } }),
    ).toThrow(FixtureResultError)
    expect(() =>
      getFixtureResult({
        ...PLAYED,
        innings: [{ battingTeam: null as never, runs: 1, wickets: 0, overs: '1', maxOvers: 20 }],
      }),
    ).toThrow('innings without batting team')
  })
})

describe('relationId', () => {
  it('reads an id or a populated document, and nothing for an empty relation', () => {
    expect(relationId(3)).toBe(3)
    expect(relationId({ id: 4 })).toBe(4)
    expect(relationId(null)).toBeNull()
    expect(relationId(undefined)).toBeNull()
  })
})
