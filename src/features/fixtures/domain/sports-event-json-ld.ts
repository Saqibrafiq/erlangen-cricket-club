import type { FixtureStatus, FixtureSummary } from '../types'

const EVENT_STATUS: Record<FixtureStatus, string> = {
  scheduled: 'https://schema.org/EventScheduled',
  completed: 'https://schema.org/EventScheduled',
  abandoned: 'https://schema.org/EventCancelled',
  cancelled: 'https://schema.org/EventCancelled',
}

function toEvent(fixture: FixtureSummary) {
  const [team1, team2] = fixture.teams
  const day = fixture.date.slice(0, 10)

  return {
    '@type': 'SportsEvent',
    name: `${team1.name} v ${team2.name}`,
    sport: 'Cricket',
    startDate: fixture.startTime ? `${day}T${fixture.startTime}` : day,
    eventStatus: EVENT_STATUS[fixture.status],
    superEvent: {
      '@type': 'SportsEvent',
      name: `${fixture.competition.name} ${fixture.competition.season}`,
    },
    competitor: fixture.teams.map((team) => ({ '@type': 'SportsTeam', name: team.name })),
    ...(fixture.ground
      ? {
          location: {
            '@type': 'Place',
            name: fixture.ground.name,
            ...(fixture.ground.address ? { address: fixture.ground.address } : {}),
          },
        }
      : {}),
  }
}

/** schema.org `SportsEvent` graph for a list of fixtures. */
export function buildFixturesJsonLd(fixtures: readonly FixtureSummary[]) {
  return {
    '@context': 'https://schema.org',
    '@graph': fixtures.map(toEvent),
  }
}
