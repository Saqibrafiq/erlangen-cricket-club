import type { FixtureGround } from '../types'

/** "Name, address" for calendars and directions; just the name while no address is saved. */
export function formatGround(ground: FixtureGround | null): string | null {
  if (!ground) {
    return null
  }
  return ground.address ? `${ground.name}, ${ground.address}` : ground.name
}
