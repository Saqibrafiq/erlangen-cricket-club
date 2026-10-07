'use server'

import config from '@payload-config'
import { getPayload } from 'payload'

import type { ContactFormState } from '../contact-form-state'
import { isSpam, parseContactMessage } from '../domain/contact-message'

/**
 * Stores a contact message for the board (admin → Club → Contact messages). Bots caught by the
 * honeypot get the normal success response, so they learn nothing, but nothing is stored.
 */
export async function submitContactMessageAction(
  _previousState: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  if (isSpam(formData)) {
    return { status: 'success' }
  }

  const result = parseContactMessage(formData)
  if (!result.success) {
    return { status: 'invalid', fieldErrors: result.fieldErrors, values: result.values }
  }

  const payload = await getPayload({ config })
  try {
    await payload.create({
      collection: 'contact-messages',
      // The collection forbids public creation; this server action is the only way in.
      overrideAccess: true,
      data: { ...result.message, status: 'new' },
    })
  } catch (error) {
    payload.logger.error({ err: error }, 'Could not store a contact message')
    return { status: 'error', values: result.message }
  }

  return { status: 'success' }
}
