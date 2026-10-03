import { describe, expect, it } from 'vitest'

import type { Competition, Fixture, Team } from '@/payload-types'

import { FixtureMappingError, mapFixture } from './map-fixture'

const TIMESTAMP = '2026-09-07T10:00:00.000Z'

const ecc: Team = {
  id: 1,
  name: 'Erlangen Cricket Club I',
  shortName: 'ECC-I',
  isClubTeam: true,
  updatedAt: TIMESTAMP,
  createdAt: TIMESTAMP,
}
const ncc: Team = {
  id: 2,
  name: 'NCC-I',
  shortName: 'NCC-I',
  isClubTeam: false,
  updatedAt: TIMESTAMP,
  createdAt: TIMESTAMP,
}
const competition: Competition = {
  id: 1,
  name: 'BCV T20 Regionalliga Bayern',
  season: '2026',
  slug: 'bcv-t20-regionalliga-bayern-2026',
  maxOvers: 20,
  updatedAt: TIMESTAMP,
  createdAt: TIMESTAMP,
}

function makeDoc(overrides: Partial<Fixture> = {}): Fixture {
  return {
    id: 10,
    competition,
    stage: 'final',
    date: '2026-09-06T12:00:00.000Z',
    team1: ncc,
    team2: ecc,
    status: 'completed',
    innings: [
      { battingTeam: 2, runs: 236, wickets: 5, overs: '20', maxOvers: 20 },
      { battingTeam: ecc, runs: 204, wickets: 10, overs: '19.2', maxOvers: 20 },
    ],
    result: { method: 'normal' },
    updatedAt: TIMESTAMP,
    createdAt: TIMESTAMP,
    ...overrides,
  }
}

describe('mapFixture', () => {
  it('derives the result and the club outcome from the innings', () => {
    const fixture = mapFixture(makeDoc())

    expect(fixture.result).toEqual({
      kind: 'win',
      winnerTeamId: 2,
      margin: { unit: 'runs', value: 32 },
      isDls: false,
    })
    expect(fixture.clubOutcome).toBe('lost')
  })

  it('maps teams in listed order and accepts batting teams as ids or objects', () => {
    const fixture = mapFixture(makeDoc())

    expect(fixture.teams.map((team) => team.shortName)).toEqual(['NCC-I', 'ECC-I'])
    expect(fixture.innings.map((innings) => innings.battingTeamId)).toEqual([2, 1])
  })

  it('uses the published winner and margin for a DLS result', () => {
    const fixture = mapFixture(
      makeDoc({ result: { method: 'dls', winner: ncc, marginValue: 51, marginUnit: 'runs' } }),
    )

    expect(fixture.result).toEqual({
      kind: 'win',
      winnerTeamId: 2,
      margin: { unit: 'runs', value: 51 },
      isDls: true,
    })
  })

  it('maps a DLS result without winner to a tie', () => {
    const fixture = mapFixture(makeDoc({ result: { method: 'dls', winner: null } }))

    expect(fixture.result).toEqual({ kind: 'tie', isDls: true })
    expect(fixture.clubOutcome).toBe('tied')
  })

  it('maps a DLS win without a published margin', () => {
    expect(mapFixture(makeDoc({ result: { method: 'dls', winner: 1 } })).result).toEqual({
      kind: 'win',
      winnerTeamId: 1,
      margin: null,
      isDls: true,
    })
  })

  it('maps a forfeit to the awarded team', () => {
    const fixture = mapFixture(makeDoc({ result: { method: 'forfeit', winner: 1 } }))

    expect(fixture.result).toEqual({ kind: 'forfeit', winnerTeamId: 1 })
    expect(fixture.clubOutcome).toBe('won')
  })

  it('maps a no result', () => {
    expect(mapFixture(makeDoc({ result: { method: 'no-result' } })).result).toEqual({
      kind: 'no-result',
    })
  })

  it('treats a missing result group as decided on the field', () => {
    expect(mapFixture(makeDoc({ result: undefined })).result?.kind).toBe('win')
  })

  it('has no result or outcome for a scheduled fixture', () => {
    const fixture = mapFixture(
      makeDoc({
        status: 'scheduled',
        innings: null,
        result: undefined,
        startTime: '11:00',
        venue: 'Erlangen',
      }),
    )

    expect(fixture.result).toBeNull()
    expect(fixture.clubOutcome).toBeNull()
    expect(fixture.innings).toEqual([])
    expect(fixture).toMatchObject({ startTime: '11:00', venue: 'Erlangen' })
  })

  it('has no club outcome when no club team plays', () => {
    const other: Team = { ...ncc, id: 3, shortName: 'MCC-I', name: 'MCC-I', isClubTeam: null }
    const fixture = mapFixture(
      makeDoc({
        team2: other,
        innings: [
          { battingTeam: 2, runs: 100, wickets: 5, overs: '20', maxOvers: 20 },
          { battingTeam: 3, runs: 90, wickets: 9, overs: '20', maxOvers: 20 },
        ],
      }),
    )

    expect(fixture.clubOutcome).toBeNull()
  })

  it('throws when relations are not populated', () => {
    expect(() => mapFixture(makeDoc({ competition: 1 }))).toThrow(FixtureMappingError)
  })

  it('throws for a forfeit without a winner', () => {
    expect(() => mapFixture(makeDoc({ result: { method: 'forfeit', winner: null } }))).toThrow(
      /forfeit/,
    )
  })
})
