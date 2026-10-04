import config from '@payload-config'
import { getPayload } from 'payload'
import { cache } from 'react'

import type { CompetitionStandings } from '../types'
import { mapStandings } from './map-standings'

// Populates each row's team.
const WITH_TEAMS = 1

/** Standings of every competition, newest season first, then by name. */
export async function getStandingsOverview(): Promise<CompetitionStandings[]> {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'competitions',
    sort: ['-season', 'name'],
    depth: WITH_TEAMS,
    pagination: false,
  })

  return docs.map(mapStandings)
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
