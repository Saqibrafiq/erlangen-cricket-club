import type { ContactErrorCode, ContactField, ContactValues } from './domain/contact-message'

/** Result of submitting the contact form, shared by the server action and the form. */
export type ContactFormState =
  | { status: 'idle' }
  | { status: 'success' }
  | {
      status: 'invalid'
      fieldErrors: Partial<Record<ContactField, ContactErrorCode>>
      values: ContactValues
    }
  /** Valid, but could not be stored; the visitor can retry or email the club. */
  | { status: 'error'; values: ContactValues }

export const INITIAL_CONTACT_STATE: ContactFormState = { status: 'idle' }
