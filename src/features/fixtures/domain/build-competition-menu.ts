import type { NavigationGroup } from '@/shared/ui/nav-menu'

import type { CompetitionNavigation } from '../types'

export type CompetitionMenuOptions = {
  /** First entry, e.g. "All fixtures & results" → /fixtures. */
  overview: { href: string; label: string }
  /** URL of one competition in this section, e.g. slug → /standings/{slug}. */
  competitionHref: (slug: string) => string
}

/**
 * Header dropdown groups for a competition-based section (fixtures, standings): the overview
 * first, then the latest season's competitions per club team.
 */
export function buildCompetitionMenu(
  navigation: CompetitionNavigation | null,
  { overview, competitionHref }: CompetitionMenuOptions,
): NavigationGroup[] {
  const overviewGroup: NavigationGroup = { links: [overview] }

  if (!navigation) {
    return [overviewGroup]
  }

  return [
    overviewGroup,
    ...navigation.teams.map(({ team, competitions }) => ({
      label: team.name,
      links: competitions.map((competition) => ({
        href: competitionHref(competition.slug),
        label: `${competition.name} ${competition.season}`,
      })),
    })),
  ]
}
