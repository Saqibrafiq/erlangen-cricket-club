import config from '@payload-config'
import { getPayload } from 'payload'
import { cache } from 'react'

import { type SeasonStandings, selectSeason } from '../domain/seasons'
import type { CompetitionStandings } from '../types'
import { mapStandings } from './map-standings'

// Populates each row's team.
const WITH_TEAMS = 1

/**
 * One season's tables, by competition name: the current (newest) season by default, or
 * `season` for the archive. Lists all seasons for the switcher.
 */
export async function getStandingsOverview(season?: string): Promise<SeasonStandings> {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'competitions',
    sort: ['-season', 'name'],
    depth: WITH_TEAMS,
    pagination: false,
  })

  return selectSeason(docs.map(mapStandings), season)
}

/**
 * One competition's standings, or `null` if no competition has this slug.
 * Cached per request: the layout, metadata and page all call it.
 */
export const getCompetitionStandings = cache(async function getCompetitionStandings(
  slug: string,
): Promise<CompetitionStandings | null> {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'competitions',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: WITH_TEAMS,
  })
  const competition = docs[0]

  return competition ? mapStandings(competition) : null
})
