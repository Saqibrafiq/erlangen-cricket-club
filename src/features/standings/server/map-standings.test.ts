import { describe, expect, it } from 'vitest'

import type { Competition, Team } from '@/payload-types'

import { mapStandings, StandingsMappingError } from './map-standings'

const TIMESTAMP = '2026-10-04T12:00:00.000Z'

const ECC: Team = {
  id: 7,
  name: 'Erlangen Cricket Club II',
  shortName: 'ECC-II',
  isClubTeam: true,
  updatedAt: TIMESTAMP,
  createdAt: TIMESTAMP,
}

const ROW = {
  played: 16,
  won: 7,
  lost: 9,
  noResult: 0,
  tied: 0,
  points: 56,
  winRate: 43.75,
  netRunRate: 0.0733,
  runsFor: 1703,
  oversFaced: '256.1',
  runsAgainst: 1739,
  oversBowled: '264.3',
}

function competition(standings: Competition['standings']): Competition {
  return {
    id: 3,
    name: 'BCV T20 1. Verbandsliga',
    season: '2026',
    maxOvers: 20,
    slug: 'bcv-t20-1-verbandsliga-2026',
    standings,
    updatedAt: TIMESTAMP,
    createdAt: TIMESTAMP,
  }
}

describe('mapStandings', () => {
  it('keeps the published order as positions and copies every column', () => {
    const { competition: summary, rows } = mapStandings(
      competition([
        { ...ROW, team: { ...ECC, id: 8, name: 'BACC', shortName: 'BACC', isClubTeam: false } },
        { ...ROW, team: ECC },
      ]),
    )

    expect(summary).toEqual({
      id: 3,
      slug: 'bcv-t20-1-verbandsliga-2026',
      name: 'BCV T20 1. Verbandsliga',
      season: '2026',
    })
    expect(rows.map((row) => [row.position, row.team.shortName])).toEqual([
      [1, 'BACC'],
      [2, 'ECC-II'],
    ])
    expect(rows[1]).toEqual({
      position: 2,
      team: { id: 7, name: 'Erlangen Cricket Club II', shortName: 'ECC-II', isClubTeam: true },
      ...ROW,
    })
  })

  it('returns no rows while the table has not been entered', () => {
    expect(mapStandings(competition(undefined)).rows).toEqual([])
  })

  it('treats a team without the club flag as an opponent', () => {
    const { rows } = mapStandings(competition([{ ...ROW, team: { ...ECC, isClubTeam: null } }]))

    expect(rows[0]?.team.isClubTeam).toBe(false)
  })

  it('fails fast when teams were not populated', () => {
    expect(() => mapStandings(competition([{ ...ROW, team: 7 }]))).toThrow(StandingsMappingError)
  })
})
