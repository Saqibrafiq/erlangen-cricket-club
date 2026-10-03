import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { JsonLd } from './json-ld'

describe('JsonLd', () => {
  it('renders the data as an ld+json script', () => {
    const { container } = render(<JsonLd data={{ '@type': 'SportsOrganization' }} />)
    const script = container.querySelector('script[type="application/ld+json"]')

    expect(script?.textContent).toBe('{"@type":"SportsOrganization"}')
  })

  it('escapes "<" so content cannot break out of the script element', () => {
    const { container } = render(<JsonLd data={{ name: '</script><b>x</b>' }} />)

    expect(container.querySelector('script')?.textContent).not.toContain('</script>')
    expect(container.querySelector('b')).toBeNull()
  })
})
