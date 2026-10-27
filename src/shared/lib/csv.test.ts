import { describe, expect, it } from 'vitest'

import { normalizeCsvHeader, parseCsv } from './csv'

describe('parseCsv', () => {
  it('splits records and cells, keeping line numbers and skipping blank lines', () => {
    expect(parseCsv('\na,b\r\n\r\n1,2\n')).toEqual([
      { line: 2, cells: ['a', 'b'] },
      { line: 4, cells: ['1', '2'] },
    ])
  })

  it('reads quoted cells with commas, escaped quotes and line breaks', () => {
    expect(parseCsv('"Erlangen, Bavaria","say ""hi""","two\nlines"\nnext')).toEqual([
      { line: 1, cells: ['Erlangen, Bavaria', 'say "hi"', 'two\nlines'] },
      { line: 3, cells: ['next'] },
    ])
  })

  it('ignores a byte order mark and keeps empty cells', () => {
    expect(parseCsv('﻿a,,c')).toEqual([{ line: 1, cells: ['a', '', 'c'] }])
  })

  it('returns nothing for an empty file', () => {
    expect(parseCsv('')).toEqual([])
  })
})

describe('normalizeCsvHeader', () => {
  it('trims, collapses spaces and upper-cases', () => {
    expect(normalizeCsvHeader('  net  rr ')).toBe('NET RR')
  })
})
