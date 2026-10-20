import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { renderWithIntl } from '@/shared/testing/render-with-intl'

import type { NewsEditing, NewsEditorActions } from '../../editor-types'
import { NewsEditor } from './news-editor'

const router = vi.hoisted(() => ({ refresh: vi.fn(), push: vi.fn() }))
vi.mock('next/navigation', async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  useRouter: () => ({ ...router, replace: vi.fn(), prefetch: vi.fn() }),
  usePathname: () => '/news/season-review',
}))

function makeEditing(actions: Partial<NewsEditorActions> = {}): NewsEditing {
  return {
    loginHref: '/login',
    actions: {
      getArticle: vi.fn(() => Promise.resolve({ status: 'error' as const })),
      getDrafts: vi.fn(),
      uploadImage: vi.fn(),
      saveArticle: vi.fn(() =>
        Promise.resolve({
          status: 'saved' as const,
          article: { id: 9, slug: 'new', isPublished: false },
        }),
      ),
      deleteArticle: vi.fn(() => Promise.resolve({ status: 'deleted' as const })),
      ...actions,
    },
  }
}

describe('NewsEditor', () => {
  it('opens an empty, wide form for a new article without loading anything', () => {
    const editing = makeEditing()
    renderWithIntl(
      <NewsEditor
        intent={{ kind: 'add' }}
        editing={editing}
        onClose={vi.fn()}
        onSaved={vi.fn()}
        onDeleted={vi.fn()}
      />,
    )

    expect(screen.getByRole('dialog', { name: 'Write article' })).toBeInTheDocument()
    expect(screen.getByLabelText('Title')).toHaveValue('')
    expect(editing.actions.getArticle).not.toHaveBeenCalled()
  })

  it('loads the article to edit and offers to retry a failed load', async () => {
    const editing = makeEditing()
    renderWithIntl(
      <NewsEditor
        intent={{ kind: 'edit', id: 4 }}
        editing={editing}
        onClose={vi.fn()}
        onSaved={vi.fn()}
        onDeleted={vi.fn()}
      />,
    )

    expect(screen.getByRole('status', { name: 'Loading article…' })).toBeInTheDocument()
    expect(await screen.findByRole('alert')).toHaveTextContent('could not be loaded')
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }))
    expect(editing.actions.getArticle).toHaveBeenCalledTimes(2)
    expect(editing.actions.getArticle).toHaveBeenCalledWith(4, 'en')
  })

  it('asks to sign in again when the session has ended', async () => {
    renderWithIntl(
      <NewsEditor
        intent={{ kind: 'edit', id: 4 }}
        editing={makeEditing({ getArticle: () => Promise.resolve({ status: 'unauthorized' }) })}
        onClose={vi.fn()}
        onSaved={vi.fn()}
        onDeleted={vi.fn()}
      />,
    )

    expect(await screen.findByRole('link', { name: 'Sign in again' })).toHaveAttribute(
      'href',
      '/login',
    )
  })

  it('goes back to the list after deleting an article from its own page', async () => {
    const onDeleted = vi.fn()
    renderWithIntl(
      <NewsEditor
        intent={{ kind: 'delete', id: 4, title: 'Season review' }}
        editing={makeEditing()}
        leaveHref="/news"
        onClose={vi.fn()}
        onSaved={vi.fn()}
        onDeleted={onDeleted}
      />,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Delete' }))

    await waitFor(() => {
      expect(onDeleted).toHaveBeenCalledWith('Season review')
    })
    expect(router.push).toHaveBeenCalledWith('/news')
  })

  it('keeps the delete dialog open with a message when deleting fails', async () => {
    renderWithIntl(
      <NewsEditor
        intent={{ kind: 'delete', id: 4, title: 'Season review' }}
        editing={makeEditing({ deleteArticle: () => Promise.resolve({ status: 'error' }) })}
        onClose={vi.fn()}
        onSaved={vi.fn()}
        onDeleted={vi.fn()}
      />,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Delete' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Could not delete')
    expect(screen.getByRole('alertdialog')).toBeInTheDocument()
  })
})
