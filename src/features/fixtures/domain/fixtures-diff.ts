import type { FixtureStage, FixtureStatus } from '../types'
import type { ImportedFixture } from './fixtures-csv'

/** A fixture an earlier import created, as the comparison needs it. */
export type ExistingImportedFixture = {
  id: number
  /** The key from `parseFixturesCsv`, without the competition prefix. */
  key: string
  day: string
  startTime: string | null
  homeShortName: string
  awayShortName: string
  groundName: string | null
  stage: FixtureStage
  status: FixtureStatus
}

export type FixtureChangeField = 'day' | 'startTime' | 'ground' | 'stage'

export type FixtureChange =
  | { kind: 'new'; fixture: ImportedFixture }
  | { kind: 'changed'; fixture: ImportedFixture; fields: FixtureChangeField[] }
  | { kind: 'unchanged'; fixture: ImportedFixture }
  /** Already played (or abandoned): the import never touches its result. */
  | { kind: 'played'; fixture: ImportedFixture }

export type FixturesDiff = {
  /** In file order. */
  changes: FixtureChange[]
  /** Upcoming fixtures from an earlier import that the file no longer lists: deleted. */
  removed: ExistingImportedFixture[]
  /** Teams and grounds we don't have yet, which the import adds. */
  newTeams: string[]
  newGrounds: string[]
  /** Nothing would change. */
  isUnchanged: boolean
}

function changedFields(
  before: ExistingImportedFixture,
  after: ImportedFixture,
): FixtureChangeField[] {
  const fields: FixtureChangeField[] = []
  if (before.day !== after.day) fields.push('day')
  if (before.startTime !== after.startTime) fields.push('startTime')
  if (before.groundName !== (after.ground?.name ?? null)) fields.push('ground')
  if (before.stage !== after.stage) fields.push('stage')
  return fields
}

function unique(values: Iterable<string>): string[] {
  return [...new Set(values)]
}

/**
 * Compares a schedule upload with the fixtures earlier imports created in the competition, so an
 * editor sees what will be added, moved, removed or left alone before confirming. Fixtures that
 * were entered by hand (in the admin) are never matched, changed or removed.
 */
export function diffFixtures(
  existing: readonly ExistingImportedFixture[],
  imported: readonly ImportedFixture[],
  known: { teams: ReadonlySet<string>; grounds: ReadonlySet<string> },
): FixturesDiff {
  const byKey = new Map(existing.map((fixture) => [fixture.key, fixture]))
  const changes = imported.map((fixture): FixtureChange => {
    const before = byKey.get(fixture.key)
    if (!before) return { kind: 'new', fixture }
    if (before.status !== 'scheduled') return { kind: 'played', fixture }
    const fields = changedFields(before, fixture)
    return fields.length > 0 ? { kind: 'changed', fixture, fields } : { kind: 'unchanged', fixture }
  })
  const importedKeys = new Set(imported.map((fixture) => fixture.key))
  const removed = existing.filter(
    (fixture) => fixture.status === 'scheduled' && !importedKeys.has(fixture.key),
  )

  return {
    changes,
    removed,
    newTeams: unique(
      imported
        .flatMap((fixture) => [fixture.homeShortName, fixture.awayShortName])
        .filter((team) => !known.teams.has(team)),
    ),
    newGrounds: unique(
      imported
        .map((fixture) => fixture.ground?.name)
        .filter((name): name is string => name !== undefined && !known.grounds.has(name)),
    ),
    isUnchanged:
      removed.length === 0 &&
      changes.every((change) => change.kind === 'unchanged' || change.kind === 'played'),
  }
}
