import type { NavigationGroup } from '@/shared/ui/nav-menu'

import type { CompetitionNavigation } from '../types'
import { FIXTURES_PATH, getCompetitionPath } from './paths'

/** Header dropdown groups: the overview first, then the latest season's competitions per club team. */
export function buildFixturesMenu(
  navigation: CompetitionNavigation | null,
  overviewLabel: string,
): NavigationGroup[] {
  const overview: NavigationGroup = { links: [{ href: FIXTURES_PATH, label: overviewLabel }] }

  if (!navigation) {
    return [overview]
  }

  return [
    overview,
    ...navigation.teams.map(({ team, competitions }) => ({
      label: team.name,
      links: competitions.map((competition) => ({
        href: getCompetitionPath(competition.slug),
        label: `${competition.name} ${competition.season}`,
      })),
    })),
  ]
}
