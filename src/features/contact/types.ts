import type { Coordinates } from './domain/map'

export type Ground = {
  name: string
  street: string
  postalCode: string
  city: string
  coordinates: Coordinates
  directions: string | null
}

export type ContactInfo = {
  email: string
  facebookUrl: string | null
  instagramUrl: string | null
  ground: Ground | null
}
