import type { NewCompetitionFieldErrors, TargetCompetition } from '@/features/competitions'

import type { FixtureFieldErrors } from './domain/fixture-form'
import type { FixturesCsvError } from './domain/fixtures-csv'
import type { ExistingImportedFixture } from './domain/fixtures-diff'
import type { ClubGround } from './domain/home-grounds'
import type { FixtureStage, FixtureStatus } from './types'

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

/** A fixture as the edit form sees it. */
export type FixtureDraft = {
  id: number
  /** "ECC-I v NCC-I", for the panel's title. */
  title: string
  day: string
  startTime: string | null
  groundId: number | null
  stage: FixtureStage
  status: FixtureStatus
}

export type GroundOption = {
  id: number
  name: string
}

export type FixtureEditorData = {
  draft: FixtureDraft
  grounds: GroundOption[]
}

export type SaveFixtureResult =
  | { status: 'saved' }
  | { status: 'invalid'; fieldErrors: FixtureFieldErrors }
  | Unauthorized
  | Failed

export type DeleteFixtureResult = { status: 'deleted' } | Unauthorized | Failed

/** The server actions the import and edit controls call, passed in by the route. */
export type FixtureEditorActions = {
  getImportData: () => Promise<FixtureEditorResult<FixtureImportData>>
  importFixtures: (formData: FormData) => Promise<ImportFixturesResult>
  getFixture: (id: number) => Promise<FixtureEditorResult<FixtureEditorData>>
  saveFixture: (formData: FormData) => Promise<SaveFixtureResult>
  deleteFixture: (id: number) => Promise<DeleteFixtureResult>
}

/** Everything the import needs besides the fixtures on the page. */
export type FixtureEditing = {
  actions: FixtureEditorActions
  /** Where to sign in again when the session has ended. */
  loginHref: string
}
