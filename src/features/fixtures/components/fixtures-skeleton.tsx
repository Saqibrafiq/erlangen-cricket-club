'use client'

// A client component on purpose: on the server, loading.tsx renders outside the page's
// setRequestLocale scope, so server-side translations would read headers() and make the route
// dynamic. On the client, messages come from the layout's NextIntlClientProvider.
import { useTranslations } from 'next-intl'

import { Skeleton } from '@/shared/ui/skeleton'

const PLACEHOLDER_CARDS = 4

/** Loading state mirroring the fixtures layout (heading, filter sidebar, card grid). */
export function FixturesSkeleton() {
  const t = useTranslations('common')

  return (
    <div role="status" className="space-y-8">
      <span className="sr-only">{t('loading')}</span>
      <Skeleton className="h-9 w-64" />
      <div className="space-y-6 lg:grid lg:grid-cols-sidebar lg:gap-8 lg:space-y-0">
        <Skeleton className="h-32 w-full lg:h-80" />
        <div>
          <div className="grid grid-cols-cards gap-3">
            {Array.from({ length: PLACEHOLDER_CARDS }, (_, index) => (
              <Skeleton key={index} className="h-40 w-full" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
