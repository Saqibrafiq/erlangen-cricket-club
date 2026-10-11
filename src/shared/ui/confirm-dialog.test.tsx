import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { ConfirmDialog, type ConfirmDialogProps } from './confirm-dialog'

const PROPS: ConfirmDialogProps = {
  open: true,
  onOpenChange: vi.fn(),
  title: 'Remove Akmal Sandhu?',
  description: 'The profile and photo are deleted. This cannot be undone.',
  confirmLabel: 'Delete',
  cancelLabel: 'Cancel',
  onConfirm: vi.fn(),
}

describe('ConfirmDialog', () => {
  it('is an alert dialog that starts on the safe choice', () => {
    render(<ConfirmDialog {...PROPS} />)

    expect(screen.getByRole('alertdialog', { name: 'Remove Akmal Sandhu?' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cancel' })).toHaveFocus()
  })

  it('confirms without closing itself, so the caller closes it once done', async () => {
    const onConfirm = vi.fn()
    const onOpenChange = vi.fn()
    render(<ConfirmDialog {...PROPS} onConfirm={onConfirm} onOpenChange={onOpenChange} />)

    await userEvent.click(screen.getByRole('button', { name: 'Delete' }))

    expect(onConfirm).toHaveBeenCalledOnce()
    expect(onOpenChange).not.toHaveBeenCalled()
  })

  it('cancels with the button', async () => {
    const onOpenChange = vi.fn()
    render(<ConfirmDialog {...PROPS} onOpenChange={onOpenChange} />)

    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('waits while pending and shows a failure', () => {
    render(<ConfirmDialog {...PROPS} isPending error="Could not delete. Please try again." />)

    expect(screen.getByRole('button', { name: 'Delete' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled()
    expect(screen.getByRole('alert')).toHaveTextContent('Could not delete. Please try again.')
  })
})
