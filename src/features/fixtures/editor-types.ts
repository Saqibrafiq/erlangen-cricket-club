import type { NewCompetitionFieldErrors, TargetCompetition } from '@/features/competitions'

import type { FixturesCsvError } from './domain/fixtures-csv'
import type { ExistingImportedFixture } from './domain/fixtures-diff'
import type { ClubGround } from './domain/home-grounds'

/** A competition a schedule can go into, with the fixtures earlier imports created. */
export type FixtureImportCompetition = TargetCompetition & {
  fixtures: ExistingImportedFixture[]
}

export type FixtureImportData = {
  /** Newest season first. */
  competitions: FixtureImportCompetition[]
  /** Short names of the teams we have. */
  teams: string[]
  /** The grounds we have, with the club playing at home there. */
  grounds: ClubGround[]
}

/** The session ended (or never existed): the editor has to sign in again. */
type Unauthorized = { status: 'unauthorized' }
/** Anything else went wrong; the editor can retry. */
type Failed = { status: 'error' }

export type FixtureEditorResult<T> = { status: 'ok'; data: T } | Unauthorized | Failed

export type ImportFixturesResult =
  | {
      status: 'imported'
      competition: { name: string; season: string }
      created: number
      updated: number
      removed: number
      teamsAdded: number
      groundsAdded: number
    }
  | { status: 'invalidFile'; errors: FixturesCsvError[] }
  | { status: 'invalid'; fieldErrors: NewCompetitionFieldErrors }
  | Unauthorized
  | Failed

/** The server actions the import calls, passed in by the route. */
export type FixtureEditorActions = {
  getImportData: () => Promise<FixtureEditorResult<FixtureImportData>>
  importFixtures: (formData: FormData) => Promise<ImportFixturesResult>
}

/** Everything the import needs besides the fixtures on the page. */
export type FixtureEditing = {
  actions: FixtureEditorActions
  /** Where to sign in again when the session has ended. */
  loginHref: string
}
