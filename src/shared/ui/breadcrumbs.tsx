import { ChevronRight } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Link } from '@/i18n/navigation'
import { cn } from '@/shared/lib/cn'

export type BreadcrumbItem = {
  label: string
  /** Omit for the current page (the last item). */
  href?: string
}

export type BreadcrumbsProps = {
  items: readonly BreadcrumbItem[]
}

/**
 * Trail to the current page on one line. A long current-page label (e.g. an article title, which
 * the page's h1 shows in full) is truncated instead of wrapping under the trail.
 */
export function Breadcrumbs({ items }: BreadcrumbsProps) {
  const t = useTranslations('breadcrumbs')

  return (
    <nav aria-label={t('label')}>
      <ol className="flex items-center gap-1 text-sm text-text-muted">
        {items.map((item, index) => (
          <li
            key={item.href ?? item.label}
            className={cn('flex items-center gap-1', item.href ? 'shrink-0' : 'min-w-0')}
          >
            {index > 0 && <ChevronRight aria-hidden="true" className="size-4 shrink-0" />}
            {item.href ? (
              <Link
                href={item.href}
                className="inline-flex min-h-6 items-center rounded-sm underline-offset-4 hover:text-text-default hover:underline"
              >
                {item.label}
              </Link>
            ) : (
              <span aria-current="page" className="truncate text-text-default">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
