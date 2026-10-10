import config from '@payload-config'
import { getPayload, type Where } from 'payload'
import { cache } from 'react'

import { buildMatchday, getFixtureDay, type Matchday } from '../domain/matchday'
import {
  buildCompetitionNavigation,
  groupCompetitionsByTeam,
  summariseCompetitions,
} from '../domain/summarise-competitions'
import type {
  CompetitionDetail,
  CompetitionNavigation,
  FixturesOverview,
  FixtureSummary,
} from '../types'
import { mapFixture } from './map-fixture'

// Populates competition and teams, which the view model needs.
const RELATION_DEPTH = 1
const UPCOMING_SORT = ['date', 'startTime', 'id']
const PAST_SORT = ['-date', 'id']
const SCHEDULED: Where = { status: { equals: 'scheduled' } }
const NOT_SCHEDULED: Where = { status: { not_equals: 'scheduled' } }
const EMPTY_RECORD = { played: 0, won: 0, lost: 0, tied: 0, noResult: 0 }

async function findFixtures(where: Where, sort: string[]): Promise<FixtureSummary[]> {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'fixtures',
    where,
    sort,
    depth: RELATION_DEPTH,
    pagination: false,
  })

  return docs.map(mapFixture)
}

/** Upcoming fixtures (soonest first) followed by all others (newest first). */
async function findFixturesInDisplayOrder(where?: Where): Promise<FixtureSummary[]> {
  const scope = (status: Where): Where => (where ? { and: [where, status] } : status)
  const [upcoming, past] = await Promise.all([
    findFixtures(scope(SCHEDULED), UPCOMING_SORT),
    findFixtures(scope(NOT_SCHEDULED), PAST_SORT),
  ])

  return [...upcoming, ...past]
}

/** All fixtures of every competition, with the competitions grouped by team for filtering. */
export async function getFixturesOverview(): Promise<FixturesOverview> {
  const fixtures = await findFixturesInDisplayOrder()

  return {
    fixtures,
    competitionsByTeam: groupCompetitionsByTeam(summariseCompetitions(fixtures)),
  }
}

/**
 * One competition's fixtures and record, or `null` if no competition has this slug.
 * Cached per request: the competition layout, page and metadata all call it.
 */
export const getCompetitionDetail = cache(async function getCompetitionDetail(
  slug: string,
): Promise<CompetitionDetail | null> {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'competitions',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 0,
  })
  const competition = docs[0]

  if (!competition) {
    return null
  }

  const fixtures = await findFixturesInDisplayOrder({ competition: { equals: competition.id } })
  const [summary] = summariseCompetitions(fixtures)

  return {
    competition: {
      id: competition.id,
      slug: competition.slug,
      name: competition.name,
      season: competition.season,
      isFeatured: competition.isFeatured ?? false,
    },
    clubTeams: summary?.clubTeams ?? [],
    record: summary?.record ?? EMPTY_RECORD,
    fixtures,
  }
})

/** Competitions of the latest season, grouped by club team, for the header menu. */
export async function getCompetitionNavigation(): Promise<CompetitionNavigation | null> {
  return buildCompetitionNavigation(summariseCompetitions(await findFixtures({}, PAST_SORT)))
}

/** Slugs of all competitions, for static generation and the sitemap. */
export async function getCompetitionSlugs(): Promise<string[]> {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'competitions',
    depth: 0,
    pagination: false,
    select: { slug: true },
  })

  return docs.map((competition) => competition.slug)
}

/**
 * The next fixture, those after it, the latest results and the season record, for the home page.
 * `now` decides which scheduled fixtures still lie ahead.
 */
export async function getMatchday(now: Date, timeZone: string): Promise<Matchday> {
  const [scheduled, played] = await Promise.all([
    findFixtures(SCHEDULED, UPCOMING_SORT),
    findFixtures(NOT_SCHEDULED, PAST_SORT),
  ])

  return buildMatchday(scheduled, played, getFixtureDay(now.toISOString(), timeZone), timeZone)
}

/** One fixture by id, or `null`; for its calendar file and Instagram graphic. */
export const getFixture = cache(async function getFixture(
  id: number,
): Promise<FixtureSummary | null> {
  const [fixture] = await findFixtures({ id: { equals: id } }, PAST_SORT)
  return fixture ?? null
})
