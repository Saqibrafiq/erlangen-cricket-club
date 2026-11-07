import { getTranslations } from 'next-intl/server'

import { resolveLocale } from '@/i18n/locale'
import { siteConfig } from '@/shared/config/site'
import { renderShareCard, SHARE_CARD_CONTENT_TYPE, SHARE_CARD_SIZE } from '@/shared/lib/share-card'

export const size = SHARE_CARD_SIZE
export const contentType = SHARE_CARD_CONTENT_TYPE
export const alt = siteConfig.name

type ImageProps = { params: Promise<{ locale: string }> }

/** The share image for every page without its own: the club and what it stands for. */
export default async function Image({ params }: ImageProps) {
  const locale = await resolveLocale(params)
  const t = await getTranslations({ locale, namespace: 'share.site' })
  return renderShareCard({ eyebrow: t('eyebrow'), title: siteConfig.name, subtitle: t('subtitle') })
}
