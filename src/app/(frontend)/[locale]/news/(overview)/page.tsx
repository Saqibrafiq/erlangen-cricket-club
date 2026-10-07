import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

import { getNewsList, NEWS_PATH, NewsList } from '@/features/news'
import { resolveLocale } from '@/i18n/locale'
import { buildAlternates } from '@/shared/lib/seo'
import { Container } from '@/shared/ui/container'

export async function generateMetadata({ params }: PageProps<'/[locale]/news'>): Promise<Metadata> {
  const locale = await resolveLocale(params)
  const t = await getTranslations({ locale, namespace: 'news' })

  return {
    title: t('title'),
    description: t('metaDescription'),
    alternates: buildAlternates(NEWS_PATH, locale),
    openGraph: { title: t('title'), description: t('metaDescription') },
  }
}

export default async function NewsPage({ params }: PageProps<'/[locale]/news'>) {
  const locale = await resolveLocale(params)
  const [t, articles] = await Promise.all([
    getTranslations({ locale, namespace: 'news' }),
    getNewsList(locale),
  ])

  return (
    <Container className="space-y-8 py-10">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{t('title')}</h1>
      <NewsList articles={articles} />
    </Container>
  )
}
