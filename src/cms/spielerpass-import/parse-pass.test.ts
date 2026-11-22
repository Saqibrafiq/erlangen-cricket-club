import { describe, expect, it } from 'vitest'

import { parsePassText } from './parse-pass'

/** The text items of a DCB Spielerpass, in reading order (sample data). */
const PASS = [
  'DEUTSCHER CRICKET BUND',
  'Spielerpass',
  'Name:',
  'Max  Mustermann',
  'Geburtsdatum:',
  '1990-01-01',
  'Vereinsname:',
  'Erlangen Cricket Club e.V.',
  'Gültig ab:',
  '2022-07-07',
  'Nr. : DCB0M00001',
]

describe('parsePassText', () => {
  it('reads the registered name, the pass number and the valid-from date', () => {
    expect(parsePassText(PASS)).toEqual({
      registeredName: 'Max Mustermann',
      passNumber: 'DCB0M00001',
      validFrom: '2022-07-07',
    })
  })

  it('never returns the date of birth', () => {
    expect(JSON.stringify(parsePassText(PASS))).not.toContain('1990-01-01')
  })

  it('reads a pass number printed apart from its label', () => {
    const split = [...PASS.slice(0, -1), 'Nr. :', 'DCB0M00002']

    expect(parsePassText(split)?.passNumber).toBe('DCB0M00002')
  })

  it('leaves out a missing or malformed valid-from date', () => {
    expect(parsePassText(PASS.filter((item) => item !== '2022-07-07'))?.validFrom).toBeNull()
    expect(parsePassText(PASS.slice(0, 8).concat('Nr. : DCB0M00001'))?.validFrom).toBeNull()
  })

  it('refuses a document that is not a Spielerpass', () => {
    expect(parsePassText(['Rechnung', 'Name:', 'Max Mustermann'])).toBeNull()
    expect(parsePassText(['Nr. : 123'])).toBeNull()
    expect(parsePassText([])).toBeNull()
  })
})
