import { screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { renderWithIntl } from '@/shared/testing/render-with-intl'

import { Breadcrumbs } from './breadcrumbs'

describe('Breadcrumbs', () => {
  it('links ancestors and marks the current page', () => {
    renderWithIntl(
      <Breadcrumbs
        items={[
          { label: 'Fixtures & Results', href: '/fixtures' },
          { label: 'BCV Regionalliga Bayern 2026' },
        ]}
      />,
    )

    const nav = screen.getByRole('navigation', { name: 'Breadcrumb' })
    expect(within(nav).getByRole('link', { name: 'Fixtures & Results' })).toHaveAttribute(
      'href',
      '/fixtures',
    )
    expect(within(nav).getByText('BCV Regionalliga Bayern 2026')).toHaveAttribute(
      'aria-current',
      'page',
    )
  })
})
