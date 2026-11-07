import { ImageResponse } from 'next/og'

import { siteConfig } from '@/shared/config/site'

import { loadBrandImageAssets } from './brand-image-assets'

/** Open Graph / Twitter large image: 1200 × 630 (1.91:1). */
export const SHARE_CARD_SIZE = { width: 1200, height: 630 } as const
export const SHARE_CARD_CONTENT_TYPE = 'image/png'

/**
 * The club kit (the ECC theme): next/og cannot read CSS variables, so the theme's tokens are
 * repeated here as hex. Cream, not white (no pure white anywhere on the site).
 */
const KIT = {
  navy: '#121d44',
  crimson: '#7d1b2a',
  burntOrange: '#a8431b',
  gold: '#f0b23c',
  cream: '#f5efe2',
  creamMuted: 'rgba(245, 239, 226, 0.78)',
  dots: 'rgba(245, 239, 226, 0.12)',
} as const

export type ShareCardContent = {
  /** A short label above the title, e.g. "Player profile". */
  eyebrow: string
  title: string
  /** One line under the title, e.g. the role or the date. */
  subtitle?: string
  /** A cut-out photo (PNG data URL) standing on the bottom edge, e.g. a player. */
  photoSrc?: string | null
}

/** Keeps long titles inside the card (Satori does not shrink text to fit). */
function titleSize(title: string): number {
  if (title.length > 60) return 56
  if (title.length > 32) return 72
  return 96
}

/**
 * The image shown when a page is shared (WhatsApp, LinkedIn, …): the club kit's navy with a
 * crimson glow, the crest and club name, a big title and, for players, their photo.
 */
export async function renderShareCard({
  eyebrow,
  title,
  subtitle,
  photoSrc,
}: ShareCardContent): Promise<ImageResponse> {
  const { crestSrc, fonts } = await loadBrandImageAssets()
  const host = new URL(siteConfig.url).host

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        position: 'relative',
        backgroundColor: KIT.navy,
        backgroundImage: `radial-gradient(circle at 85% 20%, ${KIT.burntOrange} 0%, ${KIT.crimson} 30%, ${KIT.navy} 70%)`,
        color: KIT.cream,
        fontFamily: 'Barlow',
      }}
    >
      {/* The dotted texture of the site's bands. */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          backgroundImage: `radial-gradient(${KIT.dots} 2px, transparent 2px)`,
          backgroundSize: '28px 28px',
        }}
      />
      {photoSrc && (
        // eslint-disable-next-line @next/next/no-img-element -- Satori draws plain <img> only
        <img
          src={photoSrc}
          alt=""
          height={600}
          style={{ position: 'absolute', right: 40, bottom: 0, objectFit: 'contain' }}
        />
      )}
      <div
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '56px 64px',
          width: photoSrc ? '64%' : '100%',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- Satori draws plain <img> only */}
          <img src={crestSrc} alt="" width={70} height={90} />
          <span
            style={{
              fontFamily: 'Barlow Condensed',
              fontWeight: 700,
              fontSize: 34,
              letterSpacing: 1,
              textTransform: 'uppercase',
            }}
          >
            {siteConfig.name}
          </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <span
            style={{
              fontFamily: 'Barlow Condensed',
              fontWeight: 600,
              fontSize: 30,
              letterSpacing: 4,
              textTransform: 'uppercase',
              color: KIT.gold,
            }}
          >
            {eyebrow}
          </span>
          <span
            style={{
              fontFamily: 'Barlow Condensed',
              fontWeight: 700,
              fontSize: titleSize(title),
              lineHeight: 1,
              textTransform: 'uppercase',
            }}
          >
            {title}
          </span>
          {subtitle && (
            <span style={{ fontSize: 30, color: KIT.creamMuted, lineHeight: 1.3 }}>{subtitle}</span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 64, height: 6, borderRadius: 3, backgroundColor: KIT.gold }} />
          <span style={{ fontSize: 24, color: KIT.creamMuted }}>{host}</span>
        </div>
      </div>
    </div>,
    { ...SHARE_CARD_SIZE, fonts },
  )
}
