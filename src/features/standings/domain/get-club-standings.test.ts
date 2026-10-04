import { describe, expect, it } from 'vitest'

import { STANDINGS_ROWS } from '../test-factories'
import type { CompetitionStandings } from '../types'
import { getClubStandings } from './get-club-standings'

const T20: CompetitionStandings = {
  competition: {
    id: 1,
    slug: 'bcv-t20-regionalliga-bayern-2026',
    name: 'BCV T20 Regionalliga Bayern',
    season: '2026',
  },
  rows: STANDINGS_ROWS,
}

describe('getClubStandings', () => {
  it('returns only the club rows, with the size of their table', () => {
    const [entry, ...rest] = getClubStandings([T20])

    expect(rest).toEqual([])
    expect(entry).toEqual({
      key: '1-2',
      row: STANDINGS_ROWS[1],
      teamCount: 4,
    })
  })

  it('names and links the competition when asked to', () => {
    expect(getClubStandings([T20], { withCompetition: true })[0]?.competition).toEqual({
      title: 'BCV T20 Regionalliga Bayern 2026',
      href: '/standings/bcv-t20-regionalliga-bayern-2026',
    })
  })

  it('groups the cards by team, first team first', () => {
    const secondTeam = STANDINGS_ROWS.map((row) =>
      row.team.isClubTeam
        ? { ...row, team: { ...row.team, id: 9, name: 'Erlangen Cricket Club II' } }
        : row,
    )
    const entries = getClubStandings([
      { ...T20, competition: { ...T20.competition, id: 2 }, rows: secondTeam },
      T20,
    ])

    expect(entries.map((entry) => entry.row.team.name)).toEqual([
      'Erlangen Cricket Club I',
      'Erlangen Cricket Club II',
    ])
  })

  it('returns nothing for tables without a club team or not yet entered', () => {
    const withoutClub = STANDINGS_ROWS.filter((row) => !row.team.isClubTeam)

    expect(
      getClubStandings([
        { ...T20, rows: withoutClub },
        { ...T20, rows: [] },
      ]),
    ).toEqual([])
  })
})
