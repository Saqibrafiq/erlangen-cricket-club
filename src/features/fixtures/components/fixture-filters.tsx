'use client'

import { useSearchParams } from 'next/navigation'
import { useFormatter, useTranslations } from 'next-intl'
import { useId, type ReactNode } from 'react'

import { cn } from '@/shared/lib/cn'
import { Button } from '@/shared/ui/button'

import {
  countByCategory,
  countByResult,
  filterFixtures,
  FIXTURE_CATEGORIES,
  NO_FILTERS,
  RESULT_FILTERS,
  parseFixtureFilters,
  serializeFixtureFilters,
  type Filterable,
  type FixtureFilterState,
} from '../domain/fixture-filters'
import { groupByMonth } from '../domain/group-by-month'
import { summariseOutcomes } from '../domain/summarise-outcomes'
import { ActiveFilterChips, type ActiveFilter } from './active-filter-chips'
import { RecordSummary } from './record-summary'

export type FilterableFixture = Filterable & {
  id: number
  /** ISO date, for grouping by month. */
  date: string
  /** The rendered card; built on the server so cards stay Server Components. */
  card: ReactNode
}

export type CompetitionOptionGroup = {
  label: string
  options: readonly { value: string; label: string }[]
}

export type FixtureFiltersProps = {
  items: readonly FilterableFixture[]
  /** Omit to hide the competition filter (e.g. on a competition's own page). */
  competitionGroups?: readonly CompetitionOptionGroup[]
}

type FixtureFiltersViewProps = FixtureFiltersProps & {
  filters: FixtureFilterState
  onFiltersChange: (filters: FixtureFilterState) => void
}

const ALL = 'all'

type FilterOption<V extends string> = {
  value: V
  label: string
  count: number
}

type FilterOptionGroupProps<V extends string> = {
  legend: string
  options: readonly FilterOption<V | typeof ALL>[]
  value: V | null
  onChange: (value: V | null) => void
}

/** A single-choice filter rendered as pills: native radios (visually hidden) inside labels. */
function FilterOptionGroup<V extends string>({
  legend,
  options,
  value,
  onChange,
}: FilterOptionGroupProps<V>) {
  const name = useId()

  return (
    <fieldset>
      <legend className="text-sm font-medium">{legend}</legend>
      <div className="mt-1.5 flex flex-wrap gap-2 lg:flex-col lg:flex-nowrap lg:gap-1">
        {options.map((option) => {
          const isChecked = (value ?? ALL) === option.value

          return (
            <label
              key={option.value}
              className={cn(
                'inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-full border px-4 text-sm font-medium transition-colors duration-150 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-focus-ring lg:justify-between lg:rounded-md',
                isChecked
                  ? 'border-brand-primary bg-brand-primary text-brand-on-primary'
                  : 'border-border-default hover:bg-surface-muted',
              )}
            >
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={isChecked}
                onChange={() => {
                  onChange(option.value === ALL ? null : option.value)
                }}
                className="sr-only"
              />
              {option.label} <span className="tabular-nums">({option.count})</span>
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}

function writeFiltersToUrl(filters: FixtureFilterState) {
  const query = serializeFixtureFilters(filters)
  // Next.js syncs native history updates with useSearchParams, without a server round trip.
  window.history.replaceState(null, '', query ? `?${query}` : window.location.pathname)
}

/**
 * Competition, status and result filters over a pre-rendered fixture list. State lives in the
 * URL (?competition=…&status=…&result=…) so filtered views can be shared; filtering happens in
 * the browser so the page itself stays static.
 */
export function FixtureFilters(props: FixtureFiltersProps) {
  const searchParams = useSearchParams()
  const competitionSlugs =
    props.competitionGroups?.flatMap((group) => group.options.map((option) => option.value)) ?? []

  return (
    <FixtureFiltersView
      {...props}
      filters={parseFixtureFilters(searchParams, competitionSlugs)}
      onFiltersChange={writeFiltersToUrl}
    />
  )
}

/**
 * Same layout with default filters, used as the Suspense fallback (static HTML). Keeping the
 * fallback identical to the hydrated UI avoids layout shift when the URL state takes over.
 */
export function FixtureFiltersStatic(props: FixtureFiltersProps) {
  return <FixtureFiltersView {...props} filters={NO_FILTERS} onFiltersChange={writeFiltersToUrl} />
}

function FixtureFiltersView({
  items,
  competitionGroups,
  filters,
  onFiltersChange,
}: FixtureFiltersViewProps) {
  const t = useTranslations('fixtures.filters')
  const format = useFormatter()
  const competitionSelectId = useId()

  // Faceted counts: each group counts the items matching every *other* active filter.
  const forCategoryCounts = filterFixtures(items, { ...filters, category: null })
  const forResultCounts = filterFixtures(items, { ...filters, result: null })
  const categoryCounts = countByCategory(forCategoryCounts)
  const resultCounts = countByResult(forResultCounts)
  const visible = filterFixtures(items, filters)
  const months = groupByMonth(visible)

  const competitionLabel = competitionGroups
    ?.flatMap((group) => group.options)
    .find((option) => option.value === filters.competition)?.label
  const activeFilters: ActiveFilter[] = [
    ...(filters.competition && competitionLabel
      ? [
          {
            key: 'competition',
            label: competitionLabel,
            onRemove: () => {
              onFiltersChange({ ...filters, competition: null })
            },
          },
        ]
      : []),
    ...(filters.category
      ? [
          {
            key: 'status',
            label: `${t('status')}: ${t(`category.${filters.category}`)}`,
            onRemove: () => {
              onFiltersChange({ ...filters, category: null })
            },
          },
        ]
      : []),
    ...(filters.result
      ? [
          {
            key: 'result',
            label: `${t('result')}: ${t(`outcome.${filters.result}`)}`,
            onRemove: () => {
              onFiltersChange({ ...filters, result: null })
            },
          },
        ]
      : []),
  ]

  return (
    // Mobile/tablet: filters above the list. Desktop: sticky filter sidebar beside a card grid.
    <div className="space-y-6 lg:grid lg:grid-cols-sidebar lg:items-start lg:gap-8 lg:space-y-0">
      <div role="search" aria-label={t('label')} className="space-y-4 lg:sticky lg:top-20">
        {competitionGroups && (
          <div className="flex flex-col gap-1.5">
            <label htmlFor={competitionSelectId} className="text-sm font-medium">
              {t('competition')}
            </label>
            <select
              id={competitionSelectId}
              value={filters.competition ?? ''}
              onChange={(event) => {
                onFiltersChange({ ...filters, competition: event.target.value || null })
              }}
              className="min-h-11 w-full rounded-md border border-border-default bg-surface-default px-3 text-base md:max-w-sm lg:max-w-none"
            >
              <option value="">{t('allCompetitions')}</option>
              {competitionGroups.map((group) => (
                <optgroup key={group.label} label={group.label}>
                  {group.options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
        )}

        <FilterOptionGroup
          legend={t('status')}
          value={filters.category}
          onChange={(category) => {
            onFiltersChange({ ...filters, category })
          }}
          options={[
            { value: ALL, label: t('category.all'), count: forCategoryCounts.length },
            ...FIXTURE_CATEGORIES.map((category) => ({
              value: category,
              label: t(`category.${category}`),
              count: categoryCounts[category],
            })),
          ]}
        />

        <FilterOptionGroup
          legend={t('result')}
          value={filters.result}
          onChange={(result) => {
            onFiltersChange({ ...filters, result })
          }}
          options={[
            { value: ALL, label: t('outcome.all'), count: forResultCounts.length },
            ...RESULT_FILTERS.map((result) => ({
              value: result,
              label: t(`outcome.${result}`),
              count: resultCounts[result],
            })),
          ]}
        />
      </div>

      <div className="space-y-6">
        <ActiveFilterChips
          filters={activeFilters}
          onClearAll={() => {
            onFiltersChange(NO_FILTERS)
          }}
        />
        <RecordSummary summary={summariseOutcomes(visible.map((item) => item.outcome))} />
        <p role="status" className="text-sm text-text-muted">
          {t('count', { count: visible.length })}
        </p>

        {/* Re-keyed on every filter change so the new selection fades in. */}
        <div key={serializeFixtureFilters(filters)} className="animate-fade-in space-y-8">
          {visible.length === 0 ? (
            <div className="flex flex-col items-start gap-3 rounded-lg border border-dashed border-border-default p-4">
              <p className="text-text-muted">{t('noMatches')}</p>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  onFiltersChange(NO_FILTERS)
                }}
              >
                {t('clear')}
              </Button>
            </div>
          ) : (
            months.map((month) => {
              const headingId = `month-${month.key}`
              return (
                <section key={month.key} aria-labelledby={headingId} className="space-y-3">
                  <h2
                    id={headingId}
                    className="flex items-center gap-3 text-lg font-bold tracking-wide text-text-muted uppercase after:h-px after:flex-1 after:bg-border-default"
                  >
                    {format.dateTime(new Date(month.date), { month: 'long', year: 'numeric' })}
                  </h2>
                  {/* As many ≥20rem columns as fit: 1 on phones up to 5–6 on wide monitors. */}
                  <ol className="grid grid-cols-cards gap-3">
                    {month.items.map((item) => (
                      // Each item spans the card's four section rows; see FixtureCard.
                      <li key={item.id} className="row-span-4 grid grid-rows-subgrid gap-y-0">
                        {item.card}
                      </li>
                    ))}
                  </ol>
                </section>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
