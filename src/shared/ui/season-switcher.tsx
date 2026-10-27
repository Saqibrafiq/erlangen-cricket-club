import { Link } from '@/i18n/navigation'
import { cn } from '@/shared/lib/cn'

export type SeasonSwitcherProps = {
  /** Names the navigation, e.g. "Seasons". */
  label: string
  /** Newest first, e.g. `["2027", "2026"]`. */
  seasons: readonly string[]
  current: string
  /** Where a season's page is, e.g. the current season → "/standings". */
  hrefFor: (season: string) => string
}

/**
 * Links between seasons, styled like the filter pills. Real links (not a dropdown), so every
 * season has its own URL and search engines find the archive. Hidden with a single season.
 */
export function SeasonSwitcher({ label, seasons, current, hrefFor }: SeasonSwitcherProps) {
  if (seasons.length < 2) {
    return null
  }

  return (
    <nav aria-label={label}>
      <ul className="flex flex-wrap gap-2">
        {seasons.map((season) => {
          const isCurrent = season === current
          return (
            <li key={season}>
              <Link
                href={hrefFor(season)}
                aria-current={isCurrent ? 'page' : undefined}
                className={cn(
                  'inline-flex min-h-11 items-center rounded-full border px-4 text-sm font-medium tabular-nums transition-colors duration-150',
                  isCurrent
                    ? 'border-brand-primary bg-brand-primary text-brand-on-primary'
                    : 'border-border-default hover:bg-surface-muted',
                )}
              >
                {season}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
