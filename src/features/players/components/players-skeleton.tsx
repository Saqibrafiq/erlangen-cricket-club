'use client'

// A client component on purpose: loading.tsx renders without route params, so server-side
// translations would read headers() and make the route dynamic (see arc42 §8.1).
import { useTranslations } from 'next-intl'

import { Skeleton } from '@/shared/ui/skeleton'

const PLACEHOLDER_CARDS = 4

/** Loading state mirroring the players page: hero, heading and a row of portrait cards. */
export function PlayersSkeleton() {
  const t = useTranslations('common')

  return (
    <div role="status" className="space-y-14 sm:space-y-20">
      <span className="sr-only">{t('loading')}</span>
      <Skeleton className="h-80 w-full rounded-3xl" />
      <div className="mx-auto max-w-6xl space-y-6">
        <Skeleton className="h-9 w-48" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
          {Array.from({ length: PLACEHOLDER_CARDS }, (_, index) => (
            <Skeleton key={index} className="aspect-4/5 w-full rounded-3xl" />
          ))}
        </div>
      </div>
    </div>
  )
}
