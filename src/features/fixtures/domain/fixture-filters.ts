import { z } from 'zod'

import type { TeamOutcome } from '@/domain/cricket'

import type { FixtureSummary } from '../types'

/** What a visitor can filter by. Matches without play are split by how they were decided. */
export const FIXTURE_CATEGORIES = [
  'upcoming',
  'completed',
  'abandoned',
  'walkover',
  'forfeit',
] as const

export type FixtureCategory = (typeof FIXTURE_CATEGORIES)[number]

/** Result from the club's perspective. Independent of category: a forfeit can be won or lost. */
export const RESULT_FILTERS = ['won', 'lost'] as const

export type ResultFilter = (typeof RESULT_FILTERS)[number]

export const COMPETITION_PARAM = 'competition'
export const CATEGORY_PARAM = 'status'
export const RESULT_PARAM = 'result'

const categorySchema = z.enum(FIXTURE_CATEGORIES)
const resultSchema = z.enum(RESULT_FILTERS)

export type FixtureFilterState = {
  /** Competition slug, or `null` for all competitions. */
  competition: string | null
  /** Category, or `null` for all categories. */
  category: FixtureCategory | null
  /** Club result, or `null` for all results (including ties and fixtures not yet played). */
  result: ResultFilter | null
}

export const NO_FILTERS: FixtureFilterState = { competition: null, category: null, result: null }

/** The minimum a list item needs to be filterable. */
export type Filterable = {
  competition: string
  category: FixtureCategory
  /** The club's outcome; `null` before play or when no club team takes part. */
  outcome: TeamOutcome | null
}

/** Assigns a fixture to exactly one filter category. A "no result" counts as abandoned. */
export function getFixtureCategory(
  fixture: Pick<FixtureSummary, 'status' | 'result'>,
): FixtureCategory {
  if (fixture.status === 'scheduled') return 'upcoming'
  if (fixture.status === 'abandoned' || fixture.status === 'cancelled') return 'abandoned'

  switch (fixture.result?.kind) {
    case 'forfeit':
      return 'forfeit'
    case 'walkover':
      return 'walkover'
    case 'no-result':
      return 'abandoned'
    default:
      return 'completed'
  }
}

/**
 * Reads filters from URL search params. Unknown or malformed values fall back to "all" rather
 * than failing, so stale or hand-edited links still show a page.
 */
export function parseFixtureFilters(
  params: Pick<URLSearchParams, 'get'>,
  competitionSlugs: readonly string[],
): FixtureFilterState {
  const competition = params.get(COMPETITION_PARAM)
  const category = categorySchema.safeParse(params.get(CATEGORY_PARAM))
  const result = resultSchema.safeParse(params.get(RESULT_PARAM))

  return {
    competition:
      competition !== null && competitionSlugs.includes(competition) ? competition : null,
    category: category.success ? category.data : null,
    result: result.success ? result.data : null,
  }
}

/** Query string for the filters, omitting defaults (empty string when nothing is filtered). */
export function serializeFixtureFilters(filters: FixtureFilterState): string {
  const params = new URLSearchParams()
  if (filters.competition) params.set(COMPETITION_PARAM, filters.competition)
  if (filters.category) params.set(CATEGORY_PARAM, filters.category)
  if (filters.result) params.set(RESULT_PARAM, filters.result)
  return params.toString()
}

export function filterFixtures<T extends Filterable>(
  items: readonly T[],
  filters: FixtureFilterState,
): T[] {
  return items.filter(
    (item) =>
      (filters.competition === null || item.competition === filters.competition) &&
      (filters.category === null || item.category === filters.category) &&
      (filters.result === null || item.outcome === filters.result),
  )
}

function countBy<K extends string>(
  keys: readonly K[],
  items: readonly Filterable[],
  keyOf: (item: Filterable) => string | null,
): Record<K, number> {
  const counts = Object.fromEntries(keys.map((key) => [key, 0])) as Record<K, number>

  for (const item of items) {
    const key = keyOf(item)
    if (key !== null && key in counts) {
      counts[key as K] += 1
    }
  }

  return counts
}

/** Number of items per category, for the counts shown next to each status option. */
export function countByCategory(items: readonly Filterable[]): Record<FixtureCategory, number> {
  return countBy(FIXTURE_CATEGORIES, items, (item) => item.category)
}

/** Number of club wins and losses, for the counts shown next to each result option. */
export function countByResult(items: readonly Filterable[]): Record<ResultFilter, number> {
  return countBy(RESULT_FILTERS, items, (item) => item.outcome)
}
