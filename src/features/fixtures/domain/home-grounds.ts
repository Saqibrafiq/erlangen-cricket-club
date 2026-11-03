import type { FixtureGround } from '../types'
import type { ImportedFixture } from './fixtures-csv'

/** A saved ground with the club that plays its home games there, if any. */
export type ClubGround = FixtureGround & {
  clubCode: string | null
}

/** "-I", "-II", "-1": the team number after the club code in CricClubs team codes. */
const TEAM_NUMBER_SUFFIX = /-(?:[IVX]+|\d+)$/i

/** The club of a team code, e.g. "NCC" for "NCC-II"; a code without a number is the club. */
export function getClubCode(teamShortName: string): string {
  return teamShortName.trim().replace(TEAM_NUMBER_SUFFIX, '').toUpperCase()
}

/**
 * Fills in the home team's ground where the file names none, so a schedule only needs dates and
 * teams. A ground given in the file always wins (e.g. a final at a neutral venue).
 */
export function applyHomeGrounds(
  fixtures: readonly ImportedFixture[],
  grounds: readonly ClubGround[],
): ImportedFixture[] {
  const byClub = new Map(
    grounds
      .filter((ground) => ground.clubCode)
      .map((ground) => [ground.clubCode?.toUpperCase(), ground]),
  )
  return fixtures.map((fixture) => {
    if (fixture.ground) {
      return fixture
    }
    const home = byClub.get(getClubCode(fixture.homeShortName))
    return home
      ? { ...fixture, ground: { name: home.name, address: home.address }, isHomeGround: true }
      : fixture
  })
}
