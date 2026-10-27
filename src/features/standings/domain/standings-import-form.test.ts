import { describe, expect, it } from 'vitest'

import { NEW_COMPETITION, parseStandingsImportForm } from './standings-import-form'

function formData(fields: Record<string, string>): FormData {
  const data = new FormData()
  for (const [key, value] of Object.entries(fields)) {
    data.append(key, value)
  }
  return data
}

describe('parseStandingsImportForm', () => {
  it('targets an existing competition', () => {
    expect(parseStandingsImportForm(formData({ competition: '3', csv: 'TEAM' }))).toEqual({
      success: true,
      target: { kind: 'existing', id: 3 },
      csv: 'TEAM',
    })
  })

  it('rejects a missing or malformed competition id', () => {
    expect(parseStandingsImportForm(formData({ competition: 'x' }))).toEqual({
      success: false,
      fieldErrors: { name: 'required' },
    })
  })

  it('creates a new competition for a season, trimming its name', () => {
    const result = parseStandingsImportForm(
      formData({
        competition: NEW_COMPETITION,
        name: ' BCV Regionalliga Bayern ',
        season: '2027',
        maxOvers: '50',
        csv: 'TEAM',
      }),
    )

    expect(result).toEqual({
      success: true,
      target: {
        kind: 'new',
        competition: { name: 'BCV Regionalliga Bayern', season: '2027', maxOvers: 50 },
      },
      csv: 'TEAM',
    })
  })

  it('reports each invalid field of a new competition', () => {
    expect(
      parseStandingsImportForm(
        formData({ competition: NEW_COMPETITION, name: '', season: '27', maxOvers: '40' }),
      ),
    ).toEqual({
      success: false,
      fieldErrors: { name: 'required', season: 'season', maxOvers: 'maxOvers' },
    })
  })

  it('treats a missing season and format as invalid, and a missing file as empty', () => {
    expect(
      parseStandingsImportForm(formData({ competition: NEW_COMPETITION, name: 'Cup' })),
    ).toEqual({ success: false, fieldErrors: { season: 'season', maxOvers: 'maxOvers' } })
    expect(
      parseStandingsImportForm(
        formData({
          competition: NEW_COMPETITION,
          name: 'x'.repeat(101),
          season: '2027',
          maxOvers: '20',
        }),
      ),
    ).toEqual({ success: false, fieldErrors: { name: 'tooLong' } })
  })
})
