import { ChevronRight } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Link } from '@/i18n/navigation'

export type BreadcrumbItem = {
  label: string
  /** Omit for the current page (the last item). */
  href?: string
}

export type BreadcrumbsProps = {
  items: readonly BreadcrumbItem[]
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  const t = useTranslations('breadcrumbs')

  return (
    <nav aria-label={t('label')}>
      <ol className="flex flex-wrap items-center gap-1 text-sm text-text-muted">
        {items.map((item, index) => (
          <li key={item.href ?? item.label} className="flex items-center gap-1">
            {index > 0 && <ChevronRight aria-hidden="true" className="size-4 shrink-0" />}
            {item.href ? (
              <Link
                href={item.href}
                className="inline-flex min-h-6 items-center rounded-sm underline-offset-4 hover:text-text-default hover:underline"
              >
                {item.label}
              </Link>
            ) : (
              <span aria-current="page" className="text-text-default">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
