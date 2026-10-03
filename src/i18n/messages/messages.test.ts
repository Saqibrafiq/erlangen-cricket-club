import { describe, expect, it } from 'vitest'

import de from './de.json'
import en from './en.json'

function collectKeys(value: unknown, prefix = ''): string[] {
  if (typeof value !== 'object' || value === null) {
    return [prefix]
  }

  return Object.entries(value).flatMap(([key, child]) =>
    collectKeys(child, prefix ? `${prefix}.${key}` : key),
  )
}

describe('translation messages', () => {
  it('has the same keys in German as in English', () => {
    expect(collectKeys(de).sort()).toEqual(collectKeys(en).sort())
  })
})
