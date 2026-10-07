import { notFound } from 'next/navigation'

import { getNewsArticle } from '@/features/news'
import { resolveLocale } from '@/i18n/locale'

/**
 * Validates the slug outside the page's loading.tsx Suspense boundary, where notFound() would
 * already have streamed a 200 status. The query is cached per request; the page reuses it.
 */
export default async function NewsArticleLayout({
  children,
  params,
}: LayoutProps<'/[locale]/news/[slug]'>) {
  const [locale, { slug }] = await Promise.all([resolveLocale(params), params])

  if (!(await getNewsArticle(slug, locale))) {
    notFound()
  }

  return children
}
