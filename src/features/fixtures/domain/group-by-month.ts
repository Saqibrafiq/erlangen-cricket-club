export type MonthGroup<T> = {
  /** "YYYY-MM", unique per group. */
  key: string
  /** ISO date of the group's first item, for formatting the month heading. */
  date: string
  items: T[]
}

const MONTH_KEY_LENGTH = 'YYYY-MM'.length

/**
 * Groups items by calendar month, keeping the input order of groups and of items within them.
 * Fixture dates are stored at noon UTC, so the UTC month is the local month in Germany.
 */
export function groupByMonth<T extends { date: string }>(items: readonly T[]): MonthGroup<T>[] {
  const groups: MonthGroup<T>[] = []

  for (const item of items) {
    const key = item.date.slice(0, MONTH_KEY_LENGTH)
    const current = groups.at(-1)

    if (current?.key === key) {
      current.items.push(item)
    } else {
      groups.push({ key, date: item.date, items: [item] })
    }
  }

  return groups
}
