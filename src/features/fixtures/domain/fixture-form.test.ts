import { describe, expect, it } from 'vitest'

import { parseFixtureForm } from './fixture-form'

function formData(fields: Record<string, string>): FormData {
  const data = new FormData()
  for (const [key, value] of Object.entries(fields)) {
    data.append(key, value)
  }
  return data
}

const VALID = {
  id: '60',
  day: '2027-05-23',
  startTime: '13:30',
  ground: '3',
  stage: 'league',
  status: 'scheduled',
}

describe('parseFixtureForm', () => {
  it('reads an edited fixture', () => {
    expect(parseFixtureForm(formData(VALID))).toEqual({
      success: true,
      fixture: {
        id: 60,
        day: '2027-05-23',
        startTime: '13:30',
        ground: 3,
        stage: 'league',
        status: 'scheduled',
      },
    })
  })

  it('treats an empty time and ground as not set, and a missing status as unchanged', () => {
    const { status: _status, ...withoutStatus } = VALID

    expect(
      parseFixtureForm(formData({ ...withoutStatus, startTime: '', ground: '' })),
    ).toMatchObject({
      success: true,
      fixture: { startTime: null, ground: null, status: undefined },
    })
  })

  it('reports each invalid field', () => {
    expect(
      parseFixtureForm(
        formData({
          id: '60',
          day: '23.05.2027',
          startTime: '25:00',
          ground: 'x',
          stage: 'cup',
          status: 'completed',
        }),
      ),
    ).toEqual({
      success: false,
      fieldErrors: {
        day: 'date',
        startTime: 'time',
        ground: 'required',
        stage: 'required',
        status: 'required',
      },
    })
  })

  it('rejects a day that does not exist', () => {
    expect(parseFixtureForm(formData({ ...VALID, day: '2027-13-40' }))).toMatchObject({
      success: false,
      fieldErrors: { day: 'date' },
    })
  })
})
