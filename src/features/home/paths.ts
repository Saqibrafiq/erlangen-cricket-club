export const HOME_PATH = '/'

/** The calendar file of a fixture, outside the localised routes (the extension skips the locale proxy). */
export function getFixtureCalendarPath(fixtureId: number): string {
  return `/calendar/fixture-${String(fixtureId)}.ics`
}
