import { describe, expect, it } from 'vitest'

import { ACCOUNT_NAME_MAX_LENGTH, getGreetingName, getInitials, parseAccountForm } from './account'

function formData(fields: Record<string, string>): FormData {
  const data = new FormData()
  for (const [key, value] of Object.entries(fields)) {
    data.append(key, value)
  }
  return data
}

describe('getInitials', () => {
  it.each([
    ['Saqib Rafiq', 'SR'],
    ['  saqib  ahmed  rafiq ', 'SR'],
    ['Ullas', 'U'],
  ])('reads %s as %s', (name, initials) => {
    expect(getInitials({ name, email: 'x@example.com' })).toBe(initials)
  })

  it('falls back to the start of the email without a name', () => {
    expect(getInitials({ name: null, email: 'saqib@example.com' })).toBe('SA')
    expect(getInitials({ name: '  ', email: 'e@example.com' })).toBe('E@')
  })
})

describe('parseAccountForm', () => {
  it('trims the name and normalises the email', () => {
    expect(
      parseAccountForm(formData({ name: ' Saqib Rafiq ', email: ' Saqib@Example.COM ' })),
    ).toEqual({
      success: true,
      account: { name: 'Saqib Rafiq', email: 'saqib@example.com' },
    })
  })

  it('reports a missing name and an invalid email', () => {
    expect(parseAccountForm(formData({ name: '', email: 'not-an-email' }))).toEqual({
      success: false,
      fieldErrors: { name: 'required', email: 'email' },
    })
  })

  it('reports a name that is too long', () => {
    expect(
      parseAccountForm(
        formData({ name: 'x'.repeat(ACCOUNT_NAME_MAX_LENGTH + 1), email: 'a@example.com' }),
      ),
    ).toEqual({ success: false, fieldErrors: { name: 'tooLong' } })
  })
})

describe('getGreetingName', () => {
  it('greets by first name, else by email', () => {
    expect(getGreetingName({ name: ' Saqib Rafiq ', email: 's@example.com' })).toBe('Saqib')
    expect(getGreetingName({ name: '  ', email: 's@example.com' })).toBe('s@example.com')
    expect(getGreetingName({ name: null, email: 's@example.com' })).toBe('s@example.com')
  })
})
