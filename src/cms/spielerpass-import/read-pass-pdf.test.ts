// @vitest-environment node
// pdf.js and the canvas renderer are Node-only; jsdom's typed arrays do not satisfy them.
import { PDFDocument, StandardFonts } from 'pdf-lib'
import { describe, expect, it } from 'vitest'

import { parsePassText } from './parse-pass'
import { readPassPdf } from './read-pass-pdf'

/** A DCB Spielerpass is one landscape card, about 567 × 369 pt. */
const CARD = { width: 566.93, height: 368.5 } as const

/** The lines of a pass, as the DCB lays them out (sample data, no real player). */
const LINES = [
  'DEUTSCHER CRICKET BUND',
  'Spielerpass',
  'Name:',
  'Max Mustermann',
  'Geburtsdatum:',
  '1990-01-01',
  'Vereinsname:',
  'Erlangen Cricket Club e.V.',
  'Gültig ab:',
  '2022-07-07',
  'Nr. : DCB0M00001',
]

/** A stand-in for a Spielerpass PDF: the same text, laid out top to bottom, in Times. */
async function makePassPdf(): Promise<Uint8Array> {
  const pdf = await PDFDocument.create()
  const page = pdf.addPage([CARD.width, CARD.height])
  // Times is one of the standard PDF fonts, which pdf.js loads from its own font files.
  const font = await pdf.embedFont(StandardFonts.TimesRoman)
  LINES.forEach((line, index) => {
    page.drawText(line, { x: 40, y: CARD.height - 30 - index * 28, size: 11, font })
  })
  return pdf.save()
}

describe('readPassPdf', () => {
  it('reads the text in order and renders the card as a JPEG', async () => {
    const pass = await readPassPdf(await makePassPdf())

    // pdf.js also reports empty items where the layout moves; the parser ignores those.
    expect(pass.text.filter(Boolean)).toEqual(LINES)
    // JPEG magic bytes: the card is an image the captain can show an umpire.
    expect([...pass.image.subarray(0, 3)]).toEqual([0xff, 0xd8, 0xff])
    expect(pass.image.byteLength).toBeGreaterThan(1000)
  })

  it('renders the card larger than its page, so the print stays readable', async () => {
    const { image } = await readPassPdf(await makePassPdf())

    // The JPEG's SOF0 marker carries its height and width.
    const sof = image.indexOf(Buffer.from([0xff, 0xc0]))
    expect(sof).toBeGreaterThan(0)
    const height = image.readUInt16BE(sof + 5)
    const width = image.readUInt16BE(sof + 7)
    expect(width).toBeGreaterThan(CARD.width)
    expect(height).toBeGreaterThan(CARD.height)
  })

  it('gives the import exactly what a pass needs', async () => {
    const { text } = await readPassPdf(await makePassPdf())

    expect(parsePassText(text)).toEqual({
      registeredName: 'Max Mustermann',
      passNumber: 'DCB0M00001',
      validFrom: '2022-07-07',
    })
  })
})
