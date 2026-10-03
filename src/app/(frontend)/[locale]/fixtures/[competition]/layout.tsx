import { notFound } from 'next/navigation'

import { getCompetitionDetail } from '@/features/fixtures'

/**
 * Validates the slug outside the page's loading.tsx Suspense boundary: notFound() thrown inside
 * a boundary would already have streamed a 200 status. The query is cached per request, so the
 * page reuses this result.
 */
export default async function CompetitionLayout({
  children,
  params,
}: LayoutProps<'/[locale]/fixtures/[competition]'>) {
  const { competition } = await params

  if (!(await getCompetitionDetail(competition))) {
    notFound()
  }

  return children
}
