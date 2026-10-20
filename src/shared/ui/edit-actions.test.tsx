import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { EditActions } from './edit-actions'

describe('EditActions', () => {
  it('names both icon buttons and calls the matching action', async () => {
    const onEdit = vi.fn()
    const onDelete = vi.fn()
    render(
      <EditActions
        editLabel="Edit Arun"
        deleteLabel="Delete Arun"
        onEdit={onEdit}
        onDelete={onDelete}
      />,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Edit Arun' }))
    await userEvent.click(screen.getByRole('button', { name: 'Delete Arun' }))

    expect(onEdit).toHaveBeenCalledOnce()
    expect(onDelete).toHaveBeenCalledOnce()
  })
})
