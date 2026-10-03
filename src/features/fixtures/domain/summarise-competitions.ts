import type {
  CompetitionNavigation,
  CompetitionSummary,
  FixtureCompetition,
  FixtureSummary,
  FixtureTeam,
  TeamCompetitions,
} from '../types'
import { summariseOutcomes } from './summarise-outcomes'

function compareCompetitions(a: FixtureCompetition, b: FixtureCompetition): number {
  return b.season.localeCompare(a.season) || a.name.localeCompare(b.name)
}

/**
 * Summarises every competition that appears in `fixtures`: the club teams taking part
 * (derived from the fixtures, never entered separately) and their record.
 * Sorted by season (newest first), then by name.
 */
export function summariseCompetitions(fixtures: readonly FixtureSummary[]): CompetitionSummary[] {
  const byCompetition = new Map<
    number,
    { competition: FixtureCompetition; fixtures: FixtureSummary[] }
  >()

  for (const fixture of fixtures) {
    const entry = byCompetition.get(fixture.competition.id)
    if (entry) {
      entry.fixtures.push(fixture)
    } else {
      byCompetition.set(fixture.competition.id, {
        competition: fixture.competition,
        fixtures: [fixture],
      })
    }
  }

  return [...byCompetition.values()]
    .map(({ competition, fixtures: competitionFixtures }) => {
      const clubTeams = new Map<number, FixtureTeam>()
      for (const team of competitionFixtures.flatMap((fixture) => fixture.teams)) {
        if (team.isClubTeam) clubTeams.set(team.id, team)
      }

      return {
        competition,
        clubTeams: [...clubTeams.values()].sort((a, b) => a.name.localeCompare(b.name)),
        record: summariseOutcomes(competitionFixtures.map((fixture) => fixture.clubOutcome)),
      }
    })
    .sort((a, b) => compareCompetitions(a.competition, b.competition))
}

/** Competitions grouped by club team (a competition shared by two club teams appears under each). */
export function groupCompetitionsByTeam(
  summaries: readonly CompetitionSummary[],
): TeamCompetitions[] {
  const byTeam = new Map<number, { team: FixtureTeam; competitions: FixtureCompetition[] }>()

  for (const summary of summaries) {
    for (const team of summary.clubTeams) {
      const entry = byTeam.get(team.id) ?? { team, competitions: [] }
      entry.competitions.push(summary.competition)
      byTeam.set(team.id, entry)
    }
  }

  return [...byTeam.values()]
    .sort((a, b) => a.team.name.localeCompare(b.team.name))
    .map((entry) => ({ ...entry, competitions: entry.competitions.sort(compareCompetitions) }))
}

/** Competitions of the most recent season, grouped by club team, for the header menu. */
export function buildCompetitionNavigation(
  summaries: readonly CompetitionSummary[],
): CompetitionNavigation | null {
  const latestSeason = summaries
    .map((summary) => summary.competition.season)
    .sort()
    .at(-1)

  if (latestSeason === undefined) {
    return null
  }

  return {
    season: latestSeason,
    teams: groupCompetitionsByTeam(
      summaries.filter((summary) => summary.competition.season === latestSeason),
    ),
  }
}
