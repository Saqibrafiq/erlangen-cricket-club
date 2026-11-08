import { describe, expect, it } from 'vitest'

import { isRecordId, readFormId, readFormText } from './form-data'

function formWith(entries: Record<string, string | Blob>): FormData {
  const formData = new FormData()
  for (const [name, value] of Object.entries(entries)) formData.set(name, value)
  return formData
}

describe('isRecordId', () => {
  it('accepts positive whole numbers', () => {
    expect(isRecordId(7)).toBe(true)
  })

  it.each([0, -1, 1.5, Number.NaN, '7', null, undefined])('rejects %s', (value) => {
    expect(isRecordId(value)).toBe(false)
  })
})

describe('readFormText', () => {
  it('returns the text of a field', () => {
    expect(readFormText(formWith({ name: 'Erlangen' }), 'name')).toBe('Erlangen')
  })

  it('returns an empty string when the field is missing', () => {
    expect(readFormText(formWith({}), 'name')).toBe('')
  })

  it('returns an empty string when the field is a file', () => {
    expect(readFormText(formWith({ name: new Blob(['x']) }), 'name')).toBe('')
  })
})

describe('readFormId', () => {
  it('reads the id field by default', () => {
    expect(readFormId(formWith({ id: '12' }))).toBe(12)
  })

  it('reads a named field', () => {
    expect(readFormId(formWith({ playerId: '3' }), 'playerId')).toBe(3)
  })

  it.each(['', '0', '-4', '2.5', 'abc'])('returns null for %j', (value) => {
    expect(readFormId(formWith({ id: value }))).toBeNull()
  })
})
