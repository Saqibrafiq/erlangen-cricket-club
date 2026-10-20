import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { EditorToolbar, type EditorToolbarProps } from './editor-toolbar'

function renderToolbar(props: Partial<EditorToolbarProps> = {}) {
  render(<EditorToolbar addLabel="Write article" onAdd={vi.fn()} {...props} />)
}

describe('EditorToolbar', () => {
  it('adds an item', async () => {
    const onAdd = vi.fn()
    renderToolbar({ onAdd })

    await userEvent.click(screen.getByRole('button', { name: 'Write article' }))

    expect(onAdd).toHaveBeenCalledOnce()
  })

  it('lists hidden items in a disclosure and opens one', async () => {
    const onEdit = vi.fn()
    renderToolbar({
      hidden: {
        summary: '2 drafts',
        hint: 'Not on the website until published.',
        items: [
          { id: 3, label: 'Season review' },
          { id: 4, label: 'New sponsor' },
        ],
        editLabel: (item) => `Edit “${item.label}”`,
        onEdit,
      },
    })

    await userEvent.click(screen.getByText('2 drafts'))
    await userEvent.click(screen.getByRole('button', { name: /Edit “New sponsor”/ }))

    expect(onEdit).toHaveBeenCalledWith(4)
  })

  it('shows nothing for an empty hidden list, and an error when loading failed', () => {
    renderToolbar({
      error: 'Drafts could not be loaded.',
      hidden: { summary: '0 drafts', hint: '', items: [], editLabel: () => '', onEdit: vi.fn() },
    })

    expect(screen.queryByText('0 drafts')).toBeNull()
    expect(screen.getByText('Drafts could not be loaded.')).toBeInTheDocument()
  })
})
