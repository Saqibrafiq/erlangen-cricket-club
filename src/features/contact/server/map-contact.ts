import type { Contact } from '@/payload-types'
import { siteConfig } from '@/shared/config/site'

import type { ContactInfo, Ground } from '../types'

// Typed as possibly empty: until an editor first saves the global, its required fields are unset.
function mapGround(ground: Partial<Contact['ground']> | undefined): Ground | null {
  if (
    !ground?.name ||
    !ground.street ||
    !ground.postalCode ||
    !ground.city ||
    typeof ground.latitude !== 'number' ||
    typeof ground.longitude !== 'number'
  ) {
    return null
  }

  return {
    name: ground.name,
    street: ground.street,
    postalCode: ground.postalCode,
    city: ground.city,
    coordinates: { latitude: ground.latitude, longitude: ground.longitude },
    directions: ground.directions ?? null,
  }
}

/** Maps the contact global to the page's view model; falls back to the site's email address. */
export function mapContact(global: Partial<Contact>): ContactInfo {
  return {
    email: global.email ?? siteConfig.email,
    facebookUrl: global.facebookUrl ?? null,
    instagramUrl: global.instagramUrl ?? null,
    ground: mapGround(global.ground),
  }
}
