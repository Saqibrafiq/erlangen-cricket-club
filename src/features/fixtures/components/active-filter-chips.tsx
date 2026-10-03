import { X } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Button } from '@/shared/ui/button'

export type ActiveFilter = {
  /** Stable key, e.g. "status". */
  key: string
  /** Visible text, e.g. "Status: Forfeit". */
  label: string
  onRemove: () => void
}

export type ActiveFilterChipsProps = {
  filters: readonly ActiveFilter[]
  onClearAll: () => void
}

/** The filters currently applied, each removable. Keeps the filter state visible on small screens. */
export function ActiveFilterChips({ filters, onClearAll }: ActiveFilterChipsProps) {
  const t = useTranslations('fixtures.filters')

  if (filters.length === 0) {
    return null
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <ul aria-label={t('active')} className="flex flex-wrap gap-2">
        {filters.map((filter) => (
          <li key={filter.key}>
            <button
              type="button"
              onClick={filter.onRemove}
              aria-label={t('removeFilter', { filter: filter.label })}
              className="inline-flex min-h-9 items-center gap-1.5 rounded-full bg-surface-muted pr-2 pl-3 text-sm font-medium text-text-default ring-1 ring-border-default transition-colors duration-150 hover:bg-border-default"
            >
              {filter.label}
              <X aria-hidden="true" className="size-4" />
            </button>
          </li>
        ))}
      </ul>
      {filters.length > 1 && (
        <Button variant="ghost" size="sm" onClick={onClearAll}>
          {t('clearAll')}
        </Button>
      )}
    </div>
  )
}
