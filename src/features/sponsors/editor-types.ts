import type { SponsorFieldErrors, SponsorInput } from './domain/sponsor-form'
import type { SponsorLogo } from './types'

/** A sponsor as the editor sees it: both descriptions, and whether it is shown at all. */
export type SponsorDraft = SponsorInput & {
  id: number
  logo: SponsorLogo | null
}

/** Sponsors no longer shown on the website, listed for editors. */
export type InactiveSponsor = {
  id: number
  name: string
}

/** The session ended (or never existed): the editor has to sign in again. */
type Unauthorized = { status: 'unauthorized' }
/** Anything else went wrong; the editor can retry. */
type Failed = { status: 'error' }

export type SponsorEditorResult<T> = { status: 'ok'; data: T } | Unauthorized | Failed

export type SaveSponsorResult =
  | { status: 'saved'; sponsor: { id: number; isActive: boolean } }
  | { status: 'invalid'; fieldErrors: SponsorFieldErrors }
  | Unauthorized
  | Failed

export type DeleteSponsorResult = { status: 'deleted' } | Unauthorized | Failed

/** The server actions the editing controls call, passed in by the route. */
export type SponsorEditorActions = {
  getSponsor: (id: number) => Promise<SponsorEditorResult<SponsorDraft>>
  getInactiveSponsors: () => Promise<SponsorEditorResult<InactiveSponsor[]>>
  saveSponsor: (formData: FormData) => Promise<SaveSponsorResult>
  deleteSponsor: (id: number) => Promise<DeleteSponsorResult>
}

/** Everything the editing controls need besides the sponsors. */
export type SponsorEditing = {
  actions: SponsorEditorActions
  /** Where to sign in again when the session has ended. */
  loginHref: string
}
