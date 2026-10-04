import { notFound } from 'next/navigation'

import { getCompetitionStandings } from '@/features/standings'

/**
 * Validates the slug outside the page's loading.tsx Suspense boundary, where notFound() would
 * already have streamed a 200 status. The query is cached per request; the page reuses it.
 */
export default async function CompetitionStandingsLayout({
  children,
  params,
}: LayoutProps<'/[locale]/standings/[competition]'>) {
  const { competition } = await params

  if (!(await getCompetitionStandings(competition))) {
    notFound()
  }

  return children
}
