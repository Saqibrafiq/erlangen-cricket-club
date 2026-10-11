import { describe, expect, it } from 'vitest'

import {
  ADMIN_PATH,
  EMAIL_MAX_LENGTH,
  getSafeRedirectPath,
  parseSignIn,
  PASSWORD_MAX_LENGTH,
} from './sign-in'

function formData(fields: Record<string, string>): FormData {
  const data = new FormData()
  for (const [key, value] of Object.entries(fields)) {
    data.set(key, value)
  }
  return data
}

describe('parseSignIn', () => {
  it('returns trimmed email and the password exactly as typed', () => {
    expect(parseSignIn(formData({ email: ' admin@example.com ', password: ' secret ' }))).toEqual({
      success: true,
      credentials: { email: 'admin@example.com', password: ' secret ' },
    })
  })

  it('reports both fields as required when the form is empty', () => {
    expect(parseSignIn(new FormData())).toEqual({
      success: false,
      fieldErrors: { email: 'required', password: 'required' },
      email: '',
    })
  })

  it('rejects an invalid email and keeps it for the form, but never the password', () => {
    expect(parseSignIn(formData({ email: 'admin', password: 'secret' }))).toEqual({
      success: false,
      fieldErrors: { email: 'invalidEmail' },
      email: 'admin',
    })
  })

  it('rejects absurdly long input', () => {
    const result = parseSignIn(
      formData({
        email: `${'a'.repeat(EMAIL_MAX_LENGTH)}@example.com`,
        password: 'x'.repeat(PASSWORD_MAX_LENGTH + 1),
      }),
    )

    expect(result).toMatchObject({
      success: false,
      fieldErrors: { email: 'tooLong', password: 'tooLong' },
    })
  })

  it('treats a non-text value (a file) as missing', () => {
    const data = formData({ email: 'admin@example.com' })
    data.set('password', new Blob(['secret']))

    expect(parseSignIn(data)).toMatchObject({ fieldErrors: { password: 'required' } })
  })
})

describe('getSafeRedirectPath', () => {
  it('keeps the admin home and pages inside the admin', () => {
    expect(getSafeRedirectPath('/admin')).toBe('/admin')
    expect(getSafeRedirectPath('/admin/collections/news?limit=10')).toBe(
      '/admin/collections/news?limit=10',
    )
  })

  it('falls back to the admin for anything else', () => {
    for (const target of [
      undefined,
      ['/admin/collections'],
      '',
      '/players',
      '/administrator',
      'https://evil.example/admin',
      '//evil.example/admin',
      '/admin//evil.example',
      '/admin/\\evil.example',
    ]) {
      expect(getSafeRedirectPath(target)).toBe(ADMIN_PATH)
    }
  })
})
