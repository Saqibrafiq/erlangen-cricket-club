import { describe, expect, it } from 'vitest'

import { parseSeasonForm } from './season-form'

function form(entries: Record<string, string>): FormData {
  const data = new FormData()
  for (const [name, value] of Object.entries(entries)) data.set(name, value)
  return data
}

const HEADER = { season: '2026', competition: 'club', format: 't20' }
const BATTING = {
  hasBatting: 'on',
  'batting.matches': '24',
  'batting.innings': '24',
  'batting.notOuts': '2',
  'batting.runs': '614',
  'batting.balls': '349',
  'batting.highestScore': '140',
  'batting.isHighestScoreNotOut': 'on',
  'batting.hundreds': '1',
}
const BOWLING = {
  hasBowling: 'on',
  'bowling.matches': '25',
  'bowling.overs': '110.1',
  'bowling.runsConceded': '682',
  'bowling.wickets': '56',
}

describe('parseSeasonForm', () => {
  it('reads a season with batting and bowling, treating empty counts as zero', () => {
    const result = parseSeasonForm(form({ ...HEADER, ...BATTING, ...BOWLING }))

    expect(result).toEqual({
      success: true,
      data: {
        season: 2026,
        competition: 'club',
        format: 't20',
        teamId: null,
        batting: {
          matches: 24,
          innings: 24,
          notOuts: 2,
          runs: 614,
          balls: 349,
          highestScore: 140,
          isHighestScoreNotOut: true,
          hundreds: 1,
          fifties: 0,
          fours: 0,
          sixes: 0,
        },
        bowling: expect.objectContaining({
          matches: 25,
          overs: '110.1',
          runsConceded: 682,
          wickets: 56,
          hatTricks: 0,
        }) as unknown,
      },
    })
  })

  it('leaves out a discipline that is not switched on', () => {
    const result = parseSeasonForm(form({ ...HEADER, ...BOWLING, 'batting.runs': '99' }))
    expect(result.success && result.data.batting).toBeNull()
  })

  it('treats empty overs as none bowled', () => {
    const result = parseSeasonForm(form({ ...HEADER, ...BOWLING, 'bowling.overs': '' }))
    expect(result.success && result.data.bowling?.overs).toBe('0')
  })

  it('makes a record of one team’s league matches when a team is chosen', () => {
    const result = parseSeasonForm(form({ ...HEADER, ...BATTING, teamId: '14' }))
    expect(result.success && result.data).toMatchObject({ teamId: 14, format: 'league' })
  })

  it('drops the team of a district season', () => {
    const result = parseSeasonForm(
      form({ ...HEADER, competition: 'district', format: 'all', ...BATTING, teamId: '14' }),
    )
    expect(result.success && result.data).toMatchObject({ teamId: null, format: 'all' })
  })

  it('asks for batting or bowling when neither is recorded', () => {
    expect(parseSeasonForm(form(HEADER))).toEqual({
      success: false,
      fieldErrors: { hasBatting: 'nothingRecorded' },
    })
  })

  it('rejects a season outside the club’s years, an unknown competition and a missing format', () => {
    const result = parseSeasonForm(form({ ...BATTING, season: '1999', competition: 'cup' }))
    expect(result).toEqual({
      success: false,
      fieldErrors: { season: 'invalidSeason', competition: 'required', format: 'required' },
    })
  })

  it('requires matches and whole, non-negative counts', () => {
    const result = parseSeasonForm(
      form({
        ...HEADER,
        hasBatting: 'on',
        'batting.runs': '-3',
        hasBowling: 'on',
        'bowling.matches': '2.5',
      }),
    )
    expect(result).toEqual({
      success: false,
      fieldErrors: {
        'batting.matches': 'required',
        'batting.runs': 'invalidNumber',
        'bowling.matches': 'invalidNumber',
      },
    })
  })

  it('rejects overs that are not cricket notation', () => {
    const result = parseSeasonForm(form({ ...HEADER, ...BOWLING, 'bowling.overs': '12.6' }))
    expect(result).toEqual({ success: false, fieldErrors: { 'bowling.overs': 'invalidOvers' } })
  })

  it('rejects more not-outs than innings', () => {
    const result = parseSeasonForm(
      form({ ...HEADER, ...BATTING, 'batting.innings': '3', 'batting.notOuts': '4' }),
    )
    expect(result).toEqual({
      success: false,
      fieldErrors: { 'batting.notOuts': 'notOutsAboveInnings' },
    })
  })
})
