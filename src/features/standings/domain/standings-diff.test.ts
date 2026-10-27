import { describe, expect, it } from 'vitest'

import type { ImportedStandingsRow } from './standings-csv'
import { diffStandings } from './standings-diff'

function row(teamShortName: string, played: number, points: number): ImportedStandingsRow {
  return {
    teamShortName,
    played,
    won: points / 8,
    lost: played - points / 8,
    noResult: 0,
    tied: 0,
    points,
    winRate: 50,
    netRunRate: 0,
    runsFor: 100,
    oversFaced: '20',
    runsAgainst: 100,
    oversBowled: '20',
  }
}

const KNOWN = new Set(['ECC-I', 'TSVGC', 'NCC-I'])

describe('diffStandings', () => {
  it('shows moves, points and matches added since the current table', () => {
    const current = [row('TSVGC', 12, 72), row('ECC-I', 12, 64)]
    const imported = [row('ECC-I', 14, 80), row('TSVGC', 14, 80)]

    expect(diffStandings(current, imported, KNOWN)).toEqual({
      rows: [
        {
          position: 1,
          teamShortName: 'ECC-I',
          positionChange: 1,
          pointsChange: 16,
          matchesAdded: 2,
          isNewTeam: false,
        },
        {
          position: 2,
          teamShortName: 'TSVGC',
          positionChange: -1,
          pointsChange: 8,
          matchesAdded: 2,
          isNewTeam: false,
        },
      ],
      removedTeams: [],
      isUnchanged: false,
    })
  })

  it('marks teams new to the table or to the club, and teams no longer listed', () => {
    const diff = diffStandings([row('NCC-I', 1, 8)], [row('SKCC', 1, 0)], KNOWN)

    expect(diff.rows[0]).toMatchObject({
      positionChange: null,
      pointsChange: null,
      matchesAdded: null,
      isNewTeam: true,
    })
    expect(diff.removedTeams).toEqual(['NCC-I'])
  })

  it('recognises an identical re-upload', () => {
    const table = [row('ECC-I', 14, 80), row('TSVGC', 14, 80)]

    expect(diffStandings(table, [...table], KNOWN).isUnchanged).toBe(true)
    expect(diffStandings(table, [table[1] ?? row('', 0, 0)], KNOWN).isUnchanged).toBe(false)
  })

  it('counts any changed figure as a change', () => {
    const current = [row('ECC-I', 14, 80)]
    const imported = [{ ...row('ECC-I', 14, 80), netRunRate: 1.5 }]

    expect(diffStandings(current, imported, KNOWN).isUnchanged).toBe(false)
  })
})
