'use client'

// A client component on purpose: loading.tsx renders without route params, so server-side
// translations would read headers() and make the route dynamic (see arc42 §8.1).
import { useTranslations } from 'next-intl'

import { Skeleton } from '@/shared/ui/skeleton'

const PLACEHOLDER_ROWS = 8

/** Loading state mirroring a standings page: heading and table rows. */
export function StandingsSkeleton() {
  const t = useTranslations('common')

  return (
    <div role="status" className="space-y-6">
      <span className="sr-only">{t('loading')}</span>
      <Skeleton className="h-9 w-64" />
      <div className="space-y-1.5">
        {Array.from({ length: PLACEHOLDER_ROWS }, (_, index) => (
          <Skeleton key={index} className="h-10 w-full" />
        ))}
      </div>
    </div>
  )
}
