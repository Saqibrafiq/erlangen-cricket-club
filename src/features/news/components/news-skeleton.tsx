'use client'

// A client component on purpose: loading.tsx renders without route params, so server-side
// translations would read headers() and make the route dynamic (see arc42 §8.1).
import { useTranslations } from 'next-intl'

import { Skeleton } from '@/shared/ui/skeleton'

const PLACEHOLDER_CARDS = 3

/** Loading state mirroring the news page: heading and article cards. */
export function NewsSkeleton() {
  const t = useTranslations('common')

  return (
    <div role="status" className="space-y-8">
      <span className="sr-only">{t('loading')}</span>
      <Skeleton className="h-9 w-40" />
      <div className="grid grid-cols-cards gap-6">
        {Array.from({ length: PLACEHOLDER_CARDS }, (_, index) => (
          <Skeleton key={index} className="h-80 w-full rounded-2xl" />
        ))}
      </div>
    </div>
  )
}
