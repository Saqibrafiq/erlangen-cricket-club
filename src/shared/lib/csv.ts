/** One parsed line: its 1-based line number in the file (for error messages) and its cells. */
export type CsvRecord = {
  line: number
  cells: string[]
}

const QUOTE = '"'
const BYTE_ORDER_MARK = '﻿'

/**
 * Splits CSV text into records (RFC 4180: quoted cells may contain commas, quotes as `""` and
 * line breaks). Blank lines are skipped; cells are returned as written, untrimmed.
 */
export function parseCsv(text: string): CsvRecord[] {
  const source = text.startsWith(BYTE_ORDER_MARK) ? text.slice(1) : text
  const records: CsvRecord[] = []
  let cells: string[] = []
  let cell = ''
  let isQuoted = false
  let line = 1
  let recordLine = 1

  const endRecord = () => {
    cells.push(cell)
    if (cells.some((value) => value.trim() !== '')) {
      records.push({ line: recordLine, cells })
    }
    cells = []
    cell = ''
  }

  for (let index = 0; index < source.length; index++) {
    const char = source.charAt(index)
    if (isQuoted) {
      if (char === QUOTE && source.charAt(index + 1) === QUOTE) {
        cell += QUOTE
        index++
      } else if (char === QUOTE) {
        isQuoted = false
      } else {
        if (char === '\n') line++
        cell += char
      }
      continue
    }
    if (char === QUOTE) {
      isQuoted = true
    } else if (char === ',') {
      cells.push(cell)
      cell = ''
    } else if (char === '\n' || char === '\r') {
      // "\r\n" ends one record, not two.
      if (char === '\r' && source.charAt(index + 1) === '\n') index++
      endRecord()
      line++
      recordLine = line
    } else {
      cell += char
    }
  }
  endRecord()

  return records
}

/** Header cells compared loosely: CricClubs pads them with spaces, e.g. `"  SNO "`. */
export function normalizeCsvHeader(header: string): string {
  return header.trim().replace(/\s+/g, ' ').toUpperCase()
}
