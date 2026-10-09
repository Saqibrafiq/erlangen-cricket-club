import { notFound } from 'next/navigation'

import { getPlayer } from '@/features/players'
import { resolveLocale } from '@/i18n/locale'

/**
 * Validates the slug outside the page's loading.tsx Suspense boundary, where notFound() would
 * already have streamed a 200 status. The query is cached per request; the page reuses it.
 */
export default async function PlayerProfileLayout({
  children,
  params,
}: LayoutProps<'/[locale]/players/[slug]'>) {
  const [locale, { slug }] = await Promise.all([resolveLocale(params), params])

  if (!(await getPlayer(slug, locale))) {
    notFound()
  }

  return children
}
