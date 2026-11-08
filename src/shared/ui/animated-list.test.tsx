import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { AnimatedList, AnimatedListItem } from './animated-list'

function Teams({ names, as }: { names: readonly string[]; as?: 'ul' | 'ol' }) {
  return (
    <AnimatedList as={as} aria-label="Teams">
      {names.map((name) => (
        <AnimatedListItem key={name}>{name}</AnimatedListItem>
      ))}
    </AnimatedList>
  )
}

describe('AnimatedList', () => {
  it('renders an unordered list by default', () => {
    render(<Teams names={['Erlangen', 'Nürnberg']} />)

    const list = screen.getByRole('list', { name: 'Teams' })
    expect(list.tagName).toBe('UL')
    expect(screen.getAllByRole('listitem').map((item) => item.textContent)).toEqual([
      'Erlangen',
      'Nürnberg',
    ])
  })

  it('renders an ordered list when the order means something', () => {
    render(<Teams as="ol" names={['Erlangen']} />)

    expect(screen.getByRole('list', { name: 'Teams' }).tagName).toBe('OL')
  })

  it('shows the new items after a change', () => {
    const { rerender } = render(<Teams names={['Erlangen', 'Nürnberg']} />)

    rerender(<Teams names={['Nürnberg', 'Munich']} />)

    expect(screen.getByText('Munich')).toBeInTheDocument()
    expect(screen.getByText('Nürnberg')).toBeInTheDocument()
  })
})
