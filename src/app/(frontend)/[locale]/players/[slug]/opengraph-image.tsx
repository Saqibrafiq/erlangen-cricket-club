import { getTranslations } from 'next-intl/server'

import { getPlayer } from '@/features/players'
import { resolveLocale } from '@/i18n/locale'
import { siteConfig } from '@/shared/config/site'
import { loadPhotoAsPng } from '@/shared/lib/brand-image-assets'
import { renderShareCard, SHARE_CARD_CONTENT_TYPE, SHARE_CARD_SIZE } from '@/shared/lib/share-card'

export const size = SHARE_CARD_SIZE
export const contentType = SHARE_CARD_CONTENT_TYPE
export const alt = `Player profile · ${siteConfig.name}`

type ImageProps = { params: Promise<{ locale: string; slug: string }> }

/** A player's share image: name, office and role, and their cut-out photo. */
export default async function Image({ params }: ImageProps) {
  const [locale, { slug }] = await Promise.all([resolveLocale(params), params])
  const [t, tPlayers, player] = await Promise.all([
    getTranslations({ locale, namespace: 'share.player' }),
    getTranslations({ locale, namespace: 'players' }),
    getPlayer(slug, locale),
  ])
  if (!player) {
    return renderShareCard({ eyebrow: t('eyebrow'), title: siteConfig.name })
  }
  const subtitle = [
    player.clubOffice && tPlayers(`office.${player.clubOffice}`),
    player.playingRole && tPlayers(`playingRole.${player.playingRole}`),
  ]
    .filter(Boolean)
    .join(' · ')
  const photoSrc = player.photo ? await loadPhotoAsPng(player.photo.url, siteConfig.url) : null

  return renderShareCard({
    eyebrow: t('eyebrow'),
    title: player.name,
    subtitle: subtitle || undefined,
    photoSrc,
  })
}
