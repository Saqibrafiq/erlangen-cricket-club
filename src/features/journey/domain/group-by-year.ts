import type { Milestone } from '../types'

export type MilestoneYear = {
  year: number
  milestones: readonly Milestone[]
}

/** Milestones grouped by year, keeping the given order (oldest first from the mapper). */
export function groupByYear(milestones: readonly Milestone[]): MilestoneYear[] {
  const years: MilestoneYear[] = []

  for (const milestone of milestones) {
    const current = years.at(-1)
    if (current?.year === milestone.year) {
      years[years.length - 1] = {
        year: current.year,
        milestones: [...current.milestones, milestone],
      }
    } else {
      years.push({ year: milestone.year, milestones: [milestone] })
    }
  }

  return years
}

/** In-page anchor of a year, e.g. "year-2015". */
export function yearAnchor(year: number): string {
  return `year-${year}`
}
