import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { renderWithIntl } from '@/shared/testing/render-with-intl'

import { DeleteConfirmDialog, type DeleteConfirmDialogProps } from './delete-confirm-dialog'

function renderDialog(props: Partial<DeleteConfirmDialogProps> = {}) {
  const handlers = { onDeleted: vi.fn(), onClose: vi.fn() }
  renderWithIntl(
    <DeleteConfirmDialog
      title="Remove Saqib Rafiq?"
      description="The profile and photo are deleted from the website."
      onDelete={() => Promise.resolve({ status: 'deleted' })}
      {...handlers}
      {...props}
    />,
  )
  return handlers
}

describe('DeleteConfirmDialog', () => {
  it('deletes on confirm and reports it', async () => {
    const { onDeleted } = renderDialog()

    await userEvent.click(screen.getByRole('button', { name: 'Delete' }))

    await waitFor(() => {
      expect(onDeleted).toHaveBeenCalledOnce()
    })
  })

  it('closes while the item vanishes, then reports the delete', async () => {
    const vanish = vi.fn(() => Promise.resolve())
    const { onDeleted } = renderDialog({ vanish })

    await userEvent.click(screen.getByRole('button', { name: 'Delete' }))

    await waitFor(() => {
      expect(onDeleted).toHaveBeenCalledOnce()
    })
    expect(vanish).toHaveBeenCalledOnce()
    await waitFor(() => {
      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
    })
  })

  it('stays open with the reason when deleting failed', async () => {
    const { onDeleted } = renderDialog({ onDelete: () => Promise.resolve({ status: 'error' }) })

    await userEvent.click(screen.getByRole('button', { name: 'Delete' }))

    expect(await screen.findByText('Could not delete. Please try again.')).toBeInTheDocument()
    expect(onDeleted).not.toHaveBeenCalled()
  })

  it('says so when the session has ended', async () => {
    renderDialog({ onDelete: () => Promise.resolve({ status: 'unauthorized' }) })

    await userEvent.click(screen.getByRole('button', { name: 'Delete' }))

    expect(
      await screen.findByText('Your session has ended. Please sign in again.'),
    ).toBeInTheDocument()
  })

  it('uses its own labels where given', async () => {
    renderDialog({
      confirmLabel: 'Delete season',
      errorMessage: 'The season could not be deleted.',
      onDelete: () => Promise.resolve({ status: 'error' }),
    })

    await userEvent.click(screen.getByRole('button', { name: 'Delete season' }))

    expect(await screen.findByText('The season could not be deleted.')).toBeInTheDocument()
  })

  it('closes on cancel', async () => {
    const { onClose } = renderDialog()

    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(onClose).toHaveBeenCalledOnce()
  })
})
