/**
 * Brand colours for the generated images. next/og cannot read CSS variables, so these are the
 * light-theme values of the tokens in globals.css (`--color-*`), converted from OKLCH to hex.
 */
export const PALETTE = {
  brandPrimary: '#006836',
  brandSurface: '#005e31',
  mediaOverlay: '#051b0e',
  textOnMedia: '#fcfcfc',
  highlight: '#d6efde',
  /** Faint text on the green, e.g. the ECC watermark. */
  watermark: 'rgba(252, 252, 252, 0.08)',
  muted: 'rgba(252, 252, 252, 0.75)',
  dots: 'rgba(252, 252, 252, 0.18)',
} as const

/** Instagram portrait post (4:5), the format with the most space in the feed. */
export const GRAPHIC_SIZE = { width: 1080, height: 1350 } as const
