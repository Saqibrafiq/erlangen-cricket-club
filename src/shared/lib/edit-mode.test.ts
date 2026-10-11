import { renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { EDIT_MODE_COOKIE } from '@/shared/config/edit-mode'

import { useIsEditMode } from './edit-mode'

function setCookie(value: string, maxAge = 60) {
  document.cookie = `${value}; path=/; max-age=${String(maxAge)}`
}

afterEach(() => {
  for (const name of [EDIT_MODE_COOKIE, `${EDIT_MODE_COOKIE}-other`]) {
    setCookie(`${name}=`, 0)
  }
})

describe('useIsEditMode', () => {
  it('is off for visitors', () => {
    expect(renderHook(() => useIsEditMode()).result.current).toBe(false)
  })

  it('is on when the edit-mode cookie is set', () => {
    setCookie(`${EDIT_MODE_COOKIE}=1`)

    expect(renderHook(() => useIsEditMode()).result.current).toBe(true)
  })

  it('ignores cookies that only look similar', () => {
    setCookie(`${EDIT_MODE_COOKIE}-other=1`)
    setCookie(`${EDIT_MODE_COOKIE}=0`)

    expect(renderHook(() => useIsEditMode()).result.current).toBe(false)
  })
})
