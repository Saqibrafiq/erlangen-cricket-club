import { describe, expect, it } from 'vitest'

import {
  getTeamOutcome,
  getWinnerTeamId,
  resolveMatchResult,
  type InningsScore,
} from './match-result'

function innings(battingTeamId: string, runs: number, wickets: number): InningsScore {
  return { battingTeamId, runs, wickets }
}

describe('resolveMatchResult — normal results', () => {
  it('awards a runs margin to the team batting first when it scores more', () => {
    // NCC-I 236/5 v ECC-I 204/10 — "NCC-I won by 32 Runs"
    expect(
      resolveMatchResult({
        method: 'normal',
        innings: [innings('ncc', 236, 5), innings('ecc', 204, 10)],
      }),
    ).toEqual({
      kind: 'win',
      winnerTeamId: 'ncc',
      margin: { unit: 'runs', value: 32 },
      isDls: false,
    })
  })

  it('awards a wickets-in-hand margin to a successful chase', () => {
    // NCC-I 176/10 v ECC-I 182/2 — "ECC-I won by 8 Wickets"
    expect(
      resolveMatchResult({
        method: 'normal',
        innings: [innings('ncc', 176, 10), innings('ecc', 182, 2)],
      }),
    ).toEqual({
      kind: 'win',
      winnerTeamId: 'ecc',
      margin: { unit: 'wickets', value: 8 },
      isDls: false,
    })
  })

  it('returns a tie when both innings end level', () => {
    expect(
      resolveMatchResult({
        method: 'normal',
        innings: [innings('a', 150, 6), innings('b', 150, 9)],
      }),
    ).toEqual({ kind: 'tie', isDls: false })
  })

  it('throws when a normal result has fewer than two innings', () => {
    expect(() => resolveMatchResult({ method: 'normal', innings: [innings('a', 150, 6)] })).toThrow(
      /exactly 2 innings/,
    )
  })

  it('throws when an innings has more than ten wickets', () => {
    expect(() =>
      resolveMatchResult({
        method: 'normal',
        innings: [innings('a', 150, 11), innings('b', 120, 3)],
      }),
    ).toThrow(/wickets/)
  })

  it('throws when an innings has negative runs', () => {
    expect(() =>
      resolveMatchResult({
        method: 'normal',
        innings: [innings('a', 150, 1), innings('b', -1, 3)],
      }),
    ).toThrow(/runs/)
  })
})

describe('resolveMatchResult — overrides', () => {
  it('uses the published winner and margin for a DLS result', () => {
    expect(
      resolveMatchResult({
        method: 'dls',
        winnerTeamId: 'ccb',
        margin: { unit: 'runs', value: 51 },
      }),
    ).toEqual({
      kind: 'win',
      winnerTeamId: 'ccb',
      margin: { unit: 'runs', value: 51 },
      isDls: true,
    })
  })

  it('treats a DLS result without a winner as a tie', () => {
    expect(resolveMatchResult({ method: 'dls', winnerTeamId: null, margin: null })).toEqual({
      kind: 'tie',
      isDls: true,
    })
  })

  it('records a forfeit winner', () => {
    expect(resolveMatchResult({ method: 'forfeit', winnerTeamId: 'ncc' })).toEqual({
      kind: 'forfeit',
      winnerTeamId: 'ncc',
    })
  })

  it('records a walkover winner', () => {
    expect(resolveMatchResult({ method: 'walkover', winnerTeamId: 'auxcc' })).toEqual({
      kind: 'walkover',
      winnerTeamId: 'auxcc',
    })
  })

  it('records a no result', () => {
    expect(resolveMatchResult({ method: 'no-result' })).toEqual({ kind: 'no-result' })
  })
})

describe('getTeamOutcome', () => {
  const win = resolveMatchResult({ method: 'forfeit', winnerTeamId: 'ecc' })

  it('returns won for the winning team', () => {
    expect(getTeamOutcome(win, 'ecc')).toBe('won')
  })

  it('returns lost for the other team', () => {
    expect(getTeamOutcome(win, 'ncc')).toBe('lost')
  })

  it('returns won for the winner of a match decided on the field', () => {
    const result = resolveMatchResult({
      method: 'normal',
      innings: [innings('ecc', 183, 7), innings('svl', 138, 8)],
    })
    expect(getTeamOutcome(result, 'ecc')).toBe('won')
  })

  it('returns lost for the team conceding a walkover', () => {
    expect(getTeamOutcome({ kind: 'walkover', winnerTeamId: 'auxcc' }, 'ecc')).toBe('lost')
  })

  it('returns tied for a tie', () => {
    expect(getTeamOutcome({ kind: 'tie', isDls: true }, 'ecc')).toBe('tied')
  })

  it('returns no-result when there is no result', () => {
    expect(getTeamOutcome({ kind: 'no-result' }, 'ecc')).toBe('no-result')
  })
})

describe('getWinnerTeamId', () => {
  it('returns the winner of a win, forfeit or walkover', () => {
    expect(getWinnerTeamId({ kind: 'win', winnerTeamId: 'a', margin: null, isDls: false })).toBe(
      'a',
    )
    expect(getWinnerTeamId({ kind: 'forfeit', winnerTeamId: 'b' })).toBe('b')
    expect(getWinnerTeamId({ kind: 'walkover', winnerTeamId: 'c' })).toBe('c')
  })

  it('returns null for ties and no-results', () => {
    expect(getWinnerTeamId({ kind: 'tie', isDls: false })).toBeNull()
    expect(getWinnerTeamId({ kind: 'no-result' })).toBeNull()
  })
})
