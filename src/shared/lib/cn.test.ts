import { describe, expect, it } from 'vitest'

import { cn } from './cn'

describe('cn', () => {
  it('lets later Tailwind classes override conflicting earlier ones', () => {
    expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4')
  })

  it('drops falsy values', () => {
    expect(cn('block', false, undefined, null, 'text-sm')).toBe('block text-sm')
  })
})
