import type { PlayerFieldErrors, PlayerInput } from './domain/player-form'
import type { PlayerPhoto } from './types'

/** A player as the editor sees them: everything the form edits, consent included. */
export type PlayerDraft = PlayerInput & {
  id: number
  photo: PlayerPhoto | null
}

export type TeamOption = {
  id: number
  name: string
}

/** Players without recorded consent: invisible to visitors, listed for editors. */
export type HiddenPlayer = {
  id: number
  name: string
}

export type PlayerEditorData = {
  /** `null` when adding a new player. */
  draft: PlayerDraft | null
  teams: TeamOption[]
}

/** The session ended (or never existed): the editor has to sign in again. */
type Unauthorized = { status: 'unauthorized' }
/** Anything else went wrong; the editor can retry. */
type Failed = { status: 'error' }

export type EditorResult<T> = { status: 'ok'; data: T } | Unauthorized | Failed

export type SavePlayerResult =
  | { status: 'saved'; player: { id: number; slug: string; isPublic: boolean } }
  | { status: 'invalid'; fieldErrors: PlayerFieldErrors }
  | Unauthorized
  | Failed

export type DeletePlayerResult = { status: 'deleted' } | Unauthorized | Failed

/**
 * The server actions the editing controls call, passed in by the route (like the contact form's
 * action), so the components stay testable and never import server code themselves.
 */
export type PlayerEditorActions = {
  getEditorData: (id: number | null, locale: string) => Promise<EditorResult<PlayerEditorData>>
  getHiddenPlayers: () => Promise<EditorResult<HiddenPlayer[]>>
  savePlayer: (formData: FormData) => Promise<SavePlayerResult>
  deletePlayer: (id: number) => Promise<DeletePlayerResult>
}

/** Everything the editing controls need besides the player. */
export type PlayerEditing = {
  actions: PlayerEditorActions
  /** Where to sign in again when the session has ended. */
  loginHref: string
}
