import type { ImportedStandingsRow, StandingsCsvError } from './domain/standings-csv'
import type { NewCompetitionFieldErrors } from './domain/standings-import-form'
import type { StandingsTeam } from './types'

/** A competition an import can update, with its current table to compare against. */
export type ImportableCompetition = {
  id: number
  name: string
  season: string
  rows: ImportedStandingsRow[]
}

export type StandingsImportData = {
  competitions: ImportableCompetition[]
  /** All teams we have; others are added by the import. */
  teams: StandingsTeam[]
}

/** The session ended (or never existed): the editor has to sign in again. */
type Unauthorized = { status: 'unauthorized' }
/** Anything else went wrong; the editor can retry. */
type Failed = { status: 'error' }

export type StandingsEditorResult<T> = { status: 'ok'; data: T } | Unauthorized | Failed

export type ImportStandingsResult =
  | {
      status: 'imported'
      competition: { name: string; season: string; slug: string }
      teamCount: number
      teamsAdded: number
    }
  | { status: 'invalidFile'; errors: StandingsCsvError[] }
  | { status: 'invalid'; fieldErrors: NewCompetitionFieldErrors }
  | Unauthorized
  | Failed

/** The server actions the import calls, passed in by the route. */
export type StandingsEditorActions = {
  getImportData: () => Promise<StandingsEditorResult<StandingsImportData>>
  importStandings: (formData: FormData) => Promise<ImportStandingsResult>
}

/** Everything the import needs besides the tables on the page. */
export type StandingsEditing = {
  actions: StandingsEditorActions
  /** Where to sign in again when the session has ended. */
  loginHref: string
}
