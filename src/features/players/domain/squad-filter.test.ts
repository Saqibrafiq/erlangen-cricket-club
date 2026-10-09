import { describe, expect, it } from 'vitest'

import { PLAYER } from '../test-factories'
import type { Player } from '../types'
import {
  filterSquad,
  getRoleOptions,
  getTeamOptions,
  NO_SQUAD_FILTER,
  type SquadFilter,
} from './squad-filter'

const FIRST_TEAM = { id: 1, name: 'Erlangen Cricket Club I' }
const SECOND_TEAM = { id: 2, name: 'Erlangen Cricket Club II' }

const SQUAD: Player[] = [
  { ...PLAYER, id: 1, name: 'Anna Berg', playingRole: 'batter', teams: [SECOND_TEAM] },
  { ...PLAYER, id: 2, name: 'Ben Kumar', playingRole: 'bowler', teams: [FIRST_TEAM, SECOND_TEAM] },
  { ...PLAYER, id: 3, name: 'Cem Kaya', playingRole: 'batter', teams: [FIRST_TEAM] },
  { ...PLAYER, id: 4, name: 'Dev Kumar', playingRole: null, teams: [] },
]

function names(filter: Partial<SquadFilter>): string[] {
  return filterSquad(SQUAD, { ...NO_SQUAD_FILTER, ...filter }).map((player) => player.name)
}

describe('filterSquad', () => {
  it('returns everyone without filters', () => {
    expect(names({})).toHaveLength(4)
  })

  it('filters by team, including players in several teams', () => {
    expect(names({ teamId: FIRST_TEAM.id })).toEqual(['Ben Kumar', 'Cem Kaya'])
  })

  it('filters by playing role', () => {
    expect(names({ role: 'batter' })).toEqual(['Anna Berg', 'Cem Kaya'])
  })

  it('combines name search, team and role', () => {
    expect(names({ query: 'kumar', teamId: SECOND_TEAM.id, role: 'bowler' })).toEqual(['Ben Kumar'])
    expect(names({ query: 'kumar', role: 'batter' })).toEqual([])
  })
})

describe('getTeamOptions', () => {
  it('lists each team once, by name, with its number of players', () => {
    expect(getTeamOptions(SQUAD)).toEqual([
      { team: FIRST_TEAM, count: 2 },
      { team: SECOND_TEAM, count: 2 },
    ])
  })

  it('is empty while no player has a team', () => {
    expect(getTeamOptions([{ ...PLAYER, teams: [] }])).toEqual([])
  })
})

describe('getRoleOptions', () => {
  it('lists only the roles present, in display order, with counts', () => {
    expect(getRoleOptions(SQUAD)).toEqual([
      { role: 'batter', count: 2 },
      { role: 'bowler', count: 1 },
    ])
  })
})
