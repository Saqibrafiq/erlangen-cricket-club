import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { renderWithIntl } from '@/shared/testing/render-with-intl'

import { SquadToolbar } from './squad-toolbar'

describe('SquadToolbar', () => {
  it('adds a player', async () => {
    const onAdd = vi.fn()
    renderWithIntl(
      <SquadToolbar
        getHiddenPlayers={() => Promise.resolve({ status: 'ok', data: [] })}
        refreshKey={0}
        onAdd={onAdd}
        onEdit={vi.fn()}
      />,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Add player' }))

    expect(onAdd).toHaveBeenCalled()
  })

  it('lists hidden players so they can still be edited', async () => {
    const onEdit = vi.fn()
    renderWithIntl(
      <SquadToolbar
        getHiddenPlayers={() =>
          Promise.resolve({
            status: 'ok',
            data: [
              { id: 3, name: 'Arun' },
              { id: 4, name: 'Ullas' },
            ],
          })
        }
        refreshKey={0}
        onAdd={vi.fn()}
        onEdit={onEdit}
      />,
    )

    await userEvent.click(await screen.findByText('2 hidden players'))
    await userEvent.click(screen.getByRole('button', { name: /Edit Ullas/ }))

    expect(onEdit).toHaveBeenCalledWith(4)
  })

  it('says when hidden players could not be loaded, and loads again after changes', async () => {
    const getHiddenPlayers = vi.fn(() => Promise.resolve({ status: 'error' as const }))
    const { rerender } = renderWithIntl(
      <SquadToolbar
        getHiddenPlayers={getHiddenPlayers}
        refreshKey={0}
        onAdd={vi.fn()}
        onEdit={vi.fn()}
      />,
    )

    expect(await screen.findByText('Hidden players could not be loaded.')).toBeInTheDocument()

    rerender(
      <SquadToolbar
        getHiddenPlayers={getHiddenPlayers}
        refreshKey={1}
        onAdd={vi.fn()}
        onEdit={vi.fn()}
      />,
    )
    expect(getHiddenPlayers).toHaveBeenCalledTimes(2)
  })
})
