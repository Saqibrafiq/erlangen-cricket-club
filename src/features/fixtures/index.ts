export {
  CompetitionFixtures,
  type CompetitionFixturesProps,
} from './components/competition-fixtures'
export { FixtureCard, type FixtureCardProps } from './components/fixture-card'
export { FixturesOverview, type FixturesOverviewProps } from './components/fixtures-overview'
export { FixturesSkeleton } from './components/fixtures-skeleton'
export { buildCompetitionMenu, type CompetitionMenuOptions } from './domain/build-competition-menu'
export { FIXTURES_PATH, getCompetitionPath } from './domain/paths'
export { describeResult, type ResultTranslator } from './domain/describe-result'
export { buildFixtureCalendar } from './domain/fixture-calendar'
export {
  getFixtureDay,
  getKickoff,
  getVenueKind,
  type Matchday,
  type VenueKind,
} from './domain/matchday'
export { buildFixturesJsonLd } from './domain/sports-event-json-ld'
export {
  getCompetitionDetail,
  getCompetitionNavigation,
  getCompetitionSlugs,
  getFixture,
  getFixturesOverview,
  getMatchday,
} from './server/queries'
export type {
  CompetitionDetail,
  CompetitionNavigation,
  CompetitionSummary,
  FixturesOverview as FixturesOverviewData,
  FixtureSummary,
  OutcomeSummary,
} from './types'
