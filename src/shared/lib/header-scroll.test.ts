import { describe, expect, it } from 'vitest'

import { FLOAT_AFTER_PX, isHeaderFloating } from './header-scroll'

describe('isHeaderFloating', () => {
  it('stays the large pill at the top of the page', () => {
    expect(isHeaderFloating(0)).toBe(false)
    expect(isHeaderFloating(FLOAT_AFTER_PX)).toBe(false)
  })

  it('floats as the compact pill once the page has scrolled past the top', () => {
    expect(isHeaderFloating(FLOAT_AFTER_PX + 1)).toBe(true)
    expect(isHeaderFloating(5000)).toBe(true)
  })
})
