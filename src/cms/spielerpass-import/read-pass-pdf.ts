import { createRequire } from 'node:module'
import path from 'node:path'

import { createCanvas } from '@napi-rs/canvas'
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs'

/** Rendered at this scale, a card (about 567 × 369 pt) is sharp enough to read on a phone. */
const RENDER_SCALE = 2.5
const JPEG_QUALITY = 90
/**
 * pdf.js draws the standard PDF fonts (the pass uses Times) from the files it ships with; it wants
 * the folder with forward slashes and a trailing one, also on Windows.
 */
const STANDARD_FONTS = `${path
  .join(
    path.dirname(createRequire(import.meta.url).resolve('pdfjs-dist/package.json')),
    'standard_fonts',
  )
  .split(path.sep)
  .join('/')}/`

export type PassPdf = {
  /** The page's text items in reading order. */
  text: string[]
  /** The whole card as a JPEG, as the umpire would see the pass. */
  image: Buffer
}

/**
 * Reads a DCB Spielerpass PDF (Node only, for the import): its text, and the card rendered as an
 * image. The date of birth stays only inside that image (website ADR-0025).
 */
export async function readPassPdf(bytes: Uint8Array): Promise<PassPdf> {
  const pdf = await getDocument({
    data: bytes,
    isEvalSupported: false,
    standardFontDataUrl: STANDARD_FONTS,
  }).promise
  try {
    const page = await pdf.getPage(1)
    const content = await page.getTextContent()
    const text = content.items.flatMap((item) => ('str' in item ? [item.str] : []))

    const viewport = page.getViewport({ scale: RENDER_SCALE })
    const canvas = createCanvas(Math.ceil(viewport.width), Math.ceil(viewport.height))
    const context = canvas.getContext('2d')
    context.fillStyle = '#ffffff'
    context.fillRect(0, 0, canvas.width, canvas.height)
    await page.render({
      canvas: canvas as unknown as HTMLCanvasElement,
      canvasContext: context as unknown as CanvasRenderingContext2D,
      viewport,
    }).promise
    return { text, image: canvas.toBuffer('image/jpeg', JPEG_QUALITY) }
  } finally {
    await pdf.destroy()
  }
}
