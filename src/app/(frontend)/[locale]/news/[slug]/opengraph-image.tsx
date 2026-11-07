import { getFormatter, getTranslations } from 'next-intl/server'

import { getNewsArticle } from '@/features/news'
import { resolveLocale } from '@/i18n/locale'
import { siteConfig } from '@/shared/config/site'
import { renderShareCard, SHARE_CARD_CONTENT_TYPE, SHARE_CARD_SIZE } from '@/shared/lib/share-card'

export const size = SHARE_CARD_SIZE
export const contentType = SHARE_CARD_CONTENT_TYPE
export const alt = `News · ${siteConfig.name}`

type ImageProps = { params: Promise<{ locale: string; slug: string }> }

/** A news article's share image: its title and date. */
export default async function Image({ params }: ImageProps) {
  const [locale, { slug }] = await Promise.all([resolveLocale(params), params])
  const [t, format, article] = await Promise.all([
    getTranslations({ locale, namespace: 'share.news' }),
    getFormatter({ locale }),
    getNewsArticle(slug, locale),
  ])
  if (!article) {
    return renderShareCard({ eyebrow: t('eyebrow'), title: siteConfig.name })
  }
  return renderShareCard({
    eyebrow: t('eyebrow'),
    title: article.title,
    subtitle: format.dateTime(new Date(article.publishedAt), { dateStyle: 'long' }),
  })
}
