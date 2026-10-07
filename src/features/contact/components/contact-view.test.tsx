import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { renderWithIntl } from '@/shared/testing/render-with-intl'

import type { ContactInfo } from '../types'
import { ContactView } from './contact-view'

const INFO: ContactInfo = {
  email: 'erlangencricketclub@gmail.com',
  facebookUrl: 'https://www.facebook.com/CricketClubErlangen',
  instagramUrl: 'https://www.instagram.com/er_cricketclub',
  ground: {
    name: 'Erlangen Cricket Ground',
    street: 'Siedlerstraße 1',
    postalCode: '91056',
    city: 'Erlangen',
    coordinates: { latitude: 49.593914, longitude: 10.977194 },
    directions: 'A 10–15 minute walk from Erlangen station.',
  },
}

function renderView(info = INFO) {
  renderWithIntl(
    <ContactView
      info={info}
      locale="en"
      messageAction={() => Promise.resolve({ status: 'success' })}
      privacyHref="/privacy"
    />,
  )
}

describe('ContactView', () => {
  it('leads with the page heading and the message form', () => {
    renderView()

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Contact us')
    const form = screen.getByRole('region', { name: 'Send us a message' })
    expect(within(form).getByRole('button', { name: 'Send message' })).toBeInTheDocument()
  })

  it('offers email and social media, opening social media in a new tab', () => {
    renderView()

    const channels = screen.getByRole('region', { name: 'Email and social media' })
    expect(within(channels).getByRole('link', { name: INFO.email })).toHaveAttribute(
      'href',
      `mailto:${INFO.email}`,
    )
    expect(within(channels).getByRole('link', { name: 'Facebook' })).toHaveAttribute(
      'target',
      '_blank',
    )
  })

  it('shows the ground with its address, directions and a link to a maps app', () => {
    renderView()

    const ground = screen.getByRole('region', { name: 'Our ground' })
    expect(ground).toHaveAttribute('id', 'ground')
    expect(ground).toHaveTextContent('Siedlerstraße 1, 91056 Erlangen')
    expect(ground).toHaveTextContent('A 10–15 minute walk from Erlangen station.')
    expect(within(ground).getByRole('link', { name: 'Open in maps' })).toHaveAttribute(
      'href',
      'https://www.google.com/maps/search/?api=1&query=49.593914,10.977194',
    )
  })

  it('loads the map only when asked, so nothing is sent to the map provider before', async () => {
    const user = userEvent.setup()
    renderView()

    const ground = screen.getByRole('region', { name: 'Our ground' })
    expect(ground.querySelector('iframe')).toBeNull()

    await user.click(within(ground).getByRole('button', { name: 'Show map' }))

    const map = screen.getByTitle('Map of Erlangen Cricket Ground')
    expect(map).toHaveAttribute('src', expect.stringContaining('openstreetmap.org/export/embed'))
    expect(within(ground).getByRole('link', { name: 'View larger map' })).toBeVisible()
  })

  it('leaves out what has not been filled in', () => {
    renderView({ ...INFO, facebookUrl: null, instagramUrl: null, ground: null })

    expect(screen.queryByRole('link', { name: 'Facebook' })).toBeNull()
    expect(screen.queryByRole('region', { name: 'Our ground' })).toBeNull()
  })
})
