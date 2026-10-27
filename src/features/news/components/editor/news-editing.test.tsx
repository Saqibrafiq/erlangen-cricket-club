import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { EDIT_MODE_COOKIE } from '@/shared/config/edit-mode'
import { VANISH_TIMEOUT_MS } from '@/shared/lib/use-vanishing'
import { renderWithIntl } from '@/shared/testing/render-with-intl'

import type { NewsEditing } from '../../editor-types'
import { AGM_NEWS, SPONSOR_NEWS } from '../../test-factories'
import { NewsList } from '../news-list'

vi.mock('next/navigation', async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  useRouter: () => ({ refresh: vi.fn(), push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
  usePathname: () => '/news',
}))

const EDITOR_LOAD_TIMEOUT_MS = 10_000

function makeEditing(): NewsEditing {
  return {
    loginHref: '/login',
    actions: {
      getArticle: vi.fn(),
      getDrafts: vi.fn(() =>
        Promise.resolve({ status: 'ok' as const, data: [{ id: 7, title: 'Next season' }] }),
      ),
      uploadImage: vi.fn(),
      saveArticle: vi.fn(),
      deleteArticle: vi.fn(() => Promise.resolve({ status: 'deleted' as const })),
    },
  }
}

afterEach(() => {
  document.cookie = `${EDIT_MODE_COOKIE}=; path=/; max-age=0`
})

describe('news in edit mode', () => {
  it('shows visitors the plain list, with no editing controls', () => {
    renderWithIntl(<NewsList articles={[SPONSOR_NEWS]} editing={makeEditing()} />)

    expect(screen.getByRole('article')).toHaveTextContent(SPONSOR_NEWS.title)
    expect(screen.queryByRole('button', { name: 'Write article' })).toBeNull()
    expect(screen.queryByRole('button', { name: /^Edit / })).toBeNull()
  })

  it('gives editors a toolbar with drafts, and edit and delete on every card', async () => {
    document.cookie = `${EDIT_MODE_COOKIE}=1; path=/`
    renderWithIntl(<NewsList articles={[SPONSOR_NEWS, AGM_NEWS]} editing={makeEditing()} />)

    expect(screen.getByRole('button', { name: 'Write article' })).toBeInTheDocument()
    expect(await screen.findByText('1 draft')).toBeInTheDocument()
    const [first] = screen.getAllByRole('article')
    expect(
      within(first ?? document.body).getByRole('button', { name: `Edit “${SPONSOR_NEWS.title}”` }),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: `Delete “${AGM_NEWS.title}”` })).toBeInTheDocument()
  })

  it('keeps the toolbar when there are no articles yet', () => {
    document.cookie = `${EDIT_MODE_COOKIE}=1; path=/`
    renderWithIntl(<NewsList articles={[]} editing={makeEditing()} />)

    expect(screen.getByRole('button', { name: 'Write article' })).toBeInTheDocument()
    expect(screen.getByText(/news/i)).toBeInTheDocument()
  })

  it('asks before deleting and reports the deletion', async () => {
    document.cookie = `${EDIT_MODE_COOKIE}=1; path=/`
    const editing = makeEditing()
    renderWithIntl(<NewsList articles={[AGM_NEWS]} editing={editing} />)

    await userEvent.click(screen.getByRole('button', { name: `Delete “${AGM_NEWS.title}”` }))
    // The editor is loaded on demand (Lexical and all); under a busy test run that takes a moment.
    const dialog = await screen.findByRole(
      'alertdialog',
      { name: `Delete “${AGM_NEWS.title}”?` },
      { timeout: EDITOR_LOAD_TIMEOUT_MS },
    )
    await userEvent.click(within(dialog).getByRole('button', { name: 'Delete' }))

    expect(editing.actions.deleteArticle).toHaveBeenCalledWith(AGM_NEWS.id)
    // The card first dissolves (Vanish), then the list refreshes.
    expect(
      await screen.findByText(`“${AGM_NEWS.title}” deleted.`, {}, { timeout: VANISH_TIMEOUT_MS }),
    ).toBeInTheDocument()
  })
})
