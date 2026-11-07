import { describe, expect, it } from 'vitest'

import { FIXTURES_CSV_MAX_BYTES, FIXTURES_CSV_TEMPLATE, parseFixturesCsv } from './fixtures-csv'

const HEADER = 'Date,Time,Home,Away,Ground,Address,Stage'

describe('parseFixturesCsv', () => {
  it('reads the template it offers for download', () => {
    expect(parseFixturesCsv(FIXTURES_CSV_TEMPLATE)).toEqual({
      success: true,
      fixtures: [
        {
          key: 'ECC-I|NCC-I|1',
          line: 2,
          day: '2027-05-16',
          startTime: '11:00',
          homeShortName: 'ECC-I',
          awayShortName: 'NCC-I',
          // The template leaves the ground to the home team.
          ground: null,
          stage: 'league',
        },
      ],
    })
  })

  it('reads Excel formats, optional columns and any column order', () => {
    const result = parseFixturesCsv(
      [
        'away, home ,DATE,time',
        'NCC-I,ECC-I,2027-6-1,9:30:00',
        'NCC-I,ECC-I,01/07/2027,',
        'ECC-I,NCC-I,15.7.2027,14:00',
      ].join('\n'),
    )

    expect(result.success).toBe(true)
    if (!result.success) return
    expect(
      result.fixtures.map(({ key, day, startTime, ground, stage }) => ({
        key,
        day,
        startTime,
        ground,
        stage,
      })),
    ).toEqual([
      {
        key: 'ECC-I|NCC-I|1',
        day: '2027-06-01',
        startTime: '09:30',
        ground: null,
        stage: 'league',
      },
      { key: 'ECC-I|NCC-I|2', day: '2027-07-01', startTime: null, ground: null, stage: 'league' },
      {
        key: 'NCC-I|ECC-I|1',
        day: '2027-07-15',
        startTime: '14:00',
        ground: null,
        stage: 'league',
      },
    ])
  })

  it.each([
    ['Semi Final', 'semi-final'],
    ['semifinal', 'semi-final'],
    ['FINAL', 'final'],
    ['Qualifier', 'qualifier'],
  ])('reads the stage "%s"', (cell, stage) => {
    const result = parseFixturesCsv(`${HEADER}\n16.05.2027,,ECC-I,NCC-I,,,${cell}`)

    expect(result).toMatchObject({ success: true, fixtures: [{ stage }] })
  })

  it('reports every problem with its line and column', () => {
    const result = parseFixturesCsv(
      [
        HEADER,
        '31.02.2027,25:00,ECC-I,ECC-I,,Somewhere 1,Playoff',
        'tomorrow,11:60,,NCC-I,Ground,,',
      ].join('\n'),
    )

    expect(result).toEqual({
      success: false,
      errors: [
        { code: 'notDate', line: 2, column: 'DATE', value: '31.02.2027' },
        { code: 'notTime', line: 2, column: 'TIME', value: '25:00' },
        { code: 'sameTeams', line: 2, column: 'AWAY', value: 'ECC-I' },
        { code: 'unknownStage', line: 2, column: 'STAGE', value: 'Playoff' },
        { code: 'addressWithoutGround', line: 2, column: 'ADDRESS', value: 'Somewhere 1' },
        { code: 'notDate', line: 3, column: 'DATE', value: 'tomorrow' },
        { code: 'notTime', line: 3, column: 'TIME', value: '11:60' },
        { code: 'missingTeam', line: 3, column: 'HOME', value: '' },
      ],
    })
  })

  it('reports a missing away team and short rows', () => {
    expect(parseFixturesCsv(`${HEADER}\n16.05.2027,,ECC-I`)).toEqual({
      success: false,
      errors: [{ code: 'missingTeam', line: 2, column: 'AWAY', value: '' }],
    })
  })

  it('names missing columns, and rejects empty, header-only and oversized files', () => {
    expect(parseFixturesCsv('Date,Home\n1.1.2027,ECC-I')).toEqual({
      success: false,
      errors: [{ code: 'missingColumn', column: 'AWAY' }],
    })
    expect(parseFixturesCsv('')).toEqual({ success: false, errors: [{ code: 'empty' }] })
    expect(parseFixturesCsv(HEADER)).toEqual({ success: false, errors: [{ code: 'noRows' }] })
    expect(parseFixturesCsv('x'.repeat(FIXTURES_CSV_MAX_BYTES + 1))).toEqual({
      success: false,
      errors: [{ code: 'tooLarge' }],
    })
  })
})
