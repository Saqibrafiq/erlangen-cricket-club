import type { ReactNode } from 'react'

import { GRAPHIC_SIZE, PALETTE } from '../palette'

export type GraphicFrameProps = {
  /** The club crest as a data URI. */
  crestSrc: string
  clubName: string
  /** Big label at the top, e.g. "Matchday". */
  label: string
  /** Small line at the bottom, e.g. the Instagram handle. */
  footer: string
  children: ReactNode
}

// Styles are inline: next/og (Satori) supports flexbox and inline styles only.
/** The shared look of every Instagram graphic: dotted club green, crest, label, ECC watermark. */
export function GraphicFrame({ crestSrc, clubName, label, footer, children }: GraphicFrameProps) {
  return (
    <div
      style={{
        ...GRAPHIC_SIZE,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        backgroundColor: PALETTE.mediaOverlay,
        backgroundImage: `linear-gradient(160deg, ${PALETTE.brandSurface} 0%, ${PALETTE.mediaOverlay} 75%)`,
        color: PALETTE.textOnMedia,
        fontFamily: 'Barlow',
      }}
    >
      {/* The dot texture as an SVG pattern: Satori does not tile CSS radial gradients. */}
      <svg
        width={GRAPHIC_SIZE.width}
        height={GRAPHIC_SIZE.height}
        style={{ position: 'absolute', top: 0, left: 0 }}
      >
        <defs>
          <pattern id="dots" width="28" height="28" patternUnits="userSpaceOnUse">
            <circle cx="14" cy="14" r="2" fill={PALETTE.dots} />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dots)" />
      </svg>
      <div
        style={{
          position: 'absolute',
          right: 30,
          bottom: -60,
          display: 'flex',
          fontFamily: 'Barlow Condensed',
          fontWeight: 700,
          fontSize: 460,
          letterSpacing: -20,
          color: PALETTE.watermark,
        }}
      >
        ECC
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 28, padding: '72px 80px 0' }}>
        {/* eslint-disable-next-line @next/next/no-img-element -- Satori renders plain <img> only. */}
        <img src={crestSrc} alt="" width={94} height={120} />
        <div
          style={{
            display: 'flex',
            fontFamily: 'Barlow Condensed',
            fontWeight: 600,
            fontSize: 40,
            letterSpacing: 6,
            textTransform: 'uppercase',
          }}
        >
          {clubName}
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          padding: '48px 80px 0',
          fontFamily: 'Barlow Condensed',
          fontWeight: 700,
          fontSize: 150,
          lineHeight: 1,
          textTransform: 'uppercase',
        }}
      >
        {label}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, padding: '0 80px' }}>
        {children}
      </div>

      <div
        style={{
          display: 'flex',
          padding: '0 80px 64px',
          fontSize: 32,
          color: PALETTE.muted,
        }}
      >
        {footer}
      </div>
    </div>
  )
}
