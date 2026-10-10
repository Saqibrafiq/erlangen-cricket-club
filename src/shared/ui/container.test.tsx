import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Container } from './container'

describe('Container', () => {
  it('uses the full page width by default', () => {
    render(<Container>Fixtures</Container>)

    expect(screen.getByText('Fixtures')).toHaveClass('max-w-page', 'mx-auto')
  })

  it('narrows to a readable measure for prose', () => {
    render(<Container width="prose">Impressum</Container>)

    expect(screen.getByText('Impressum')).toHaveClass('max-w-3xl')
  })

  it('can render its child element instead of a div', () => {
    render(
      <Container asChild>
        <section aria-label="Results">Results</section>
      </Container>,
    )

    expect(screen.getByRole('region', { name: 'Results' })).toHaveClass('max-w-page')
  })
})
