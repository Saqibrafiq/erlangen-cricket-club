import { describe, expect, it } from 'vitest'

import type { ImportedFixture } from './fixtures-csv'
import { applyHomeGrounds, getClubCode } from './home-grounds'

function fixture(homeShortName: string, ground: ImportedFixture['ground'] = null): ImportedFixture {
  return {
    key: `${homeShortName}|X|1`,
    line: 2,
    day: '2027-05-16',
    startTime: null,
    homeShortName,
    awayShortName: 'X',
    ground,
    stage: 'league',
  }
}

const GROUNDS = [
  { name: 'Erlangen Cricket Ground', address: 'Siedlerstraße 1, 91056 Erlangen', clubCode: 'ECC' },
  { name: 'Nürnberg – Pitch 2', address: 'Wacholderweg 25, Nürnberg', clubCode: null },
  { name: 'Kirchanschöring', address: null, clubCode: 'SKCC' },
]

describe('getClubCode', () => {
  it.each([
    ['ECC-I', 'ECC'],
    ['NCC-II', 'NCC'],
    ['DWCC-1', 'DWCC'],
    ['SKCC', 'SKCC'],
    [' ssc-i ', 'SSC'],
  ])('reads the club of %s as %s', (team, club) => {
    expect(getClubCode(team)).toBe(club)
  })
})

describe('applyHomeGrounds', () => {
  it("plays at the home team's ground when the file names none", () => {
    expect(applyHomeGrounds([fixture('ECC-II'), fixture('SKCC')], GROUNDS)).toEqual([
      {
        ...fixture('ECC-II'),
        ground: { name: 'Erlangen Cricket Ground', address: 'Siedlerstraße 1, 91056 Erlangen' },
        isHomeGround: true,
      },
      {
        ...fixture('SKCC'),
        ground: { name: 'Kirchanschöring', address: null },
        isHomeGround: true,
      },
    ])
  })

  it('keeps a ground given in the file, and leaves clubs without a saved ground alone', () => {
    const neutral = fixture('ECC-I', { name: 'Taufkirchen', address: null })

    expect(applyHomeGrounds([neutral, fixture('NEW-I')], GROUNDS)).toEqual([
      neutral,
      fixture('NEW-I'),
    ])
  })
})
