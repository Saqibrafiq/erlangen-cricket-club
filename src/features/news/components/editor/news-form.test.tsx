import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { renderWithIntl } from '@/shared/testing/render-with-intl'

import type { NewsDraft, SaveNewsResult, UploadImageResult } from '../../editor-types'
import { NewsForm, type NewsFormProps } from './news-form'

const BODY: NewsDraft['body'] = {
  root: {
    type: 'root',
    direction: 'ltr',
    format: '',
    indent: 0,
    version: 1,
    children: [
      {
        type: 'paragraph',
        direction: 'ltr',
        format: '',
        indent: 0,
        version: 1,
        textFormat: 0,
        textStyle: '',
        children: [
          {
            type: 'text',
            text: 'A good year.',
            format: 0,
            detail: 0,
            mode: 'normal',
            style: '',
            version: 1,
          },
        ],
      },
    ],
  },
}

const IMAGE = { id: 30, url: '/api/media/file/a.webp', alt: 'A', width: 1200, height: 800 }

const DRAFT: NewsDraft = {
  id: 4,
  slug: 'season-review',
  title: 'Season review',
  excerpt: 'A good year.',
  body: BODY,
  publishedAt: '2026-10-12',
  featuredImage: IMAGE,
  featuredImageStyle: 'photo',
  gallery: [{ ...IMAGE, id: 31 }],
  status: 'published',
}

function renderForm(props: Partial<NewsFormProps> = {}) {
  const saveArticle = vi.fn((_formData: FormData): Promise<SaveNewsResult> =>
    Promise.resolve({
      status: 'saved',
      article: { id: 4, slug: 'season-review', isPublished: true },
    }),
  )
  const uploadImage = vi.fn((_formData: FormData): Promise<UploadImageResult> =>
    Promise.resolve({ status: 'ok', image: { ...IMAGE, id: 40 } }),
  )
  const onSaved = vi.fn()
  renderWithIntl(
    <NewsForm
      draft={DRAFT}
      locale="en"
      loginHref="/login"
      actions={{ saveArticle, uploadImage }}
      onSaved={onSaved}
      onCancel={vi.fn()}
      {...props}
    />,
  )
  return { saveArticle, uploadImage, onSaved }
}

describe('NewsForm', () => {
  it('shows the article as stored, in the language being edited', async () => {
    renderForm()

    expect(screen.getByLabelText('Title')).toHaveValue('Season review')
    expect(screen.getByLabelText('Summary')).toHaveValue('A good year.')
    expect(screen.getByLabelText('Date')).toHaveValue('2026-10-12')
    expect(screen.getByText(/editing the English version/)).toBeInTheDocument()
    await waitFor(() => {
      expect(screen.getByRole('textbox', { name: 'Text' })).toHaveTextContent('A good year.')
    })
    expect(screen.getByRole('button', { name: 'Remove photo 1' })).toBeInTheDocument()
  })

  it('saves a published article with its images and text', async () => {
    const { saveArticle, onSaved } = renderForm()

    await userEvent.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => {
      expect(onSaved).toHaveBeenCalledWith(
        { id: 4, slug: 'season-review', isPublished: true },
        'Season review',
      )
    })
    const formData = saveArticle.mock.calls[0]?.[0]
    expect(formData?.get('status')).toBe('published')
    expect(formData?.get('featuredImage')).toBe('30')
    expect(formData?.getAll('gallery')).toEqual(['31'])
    const body = formData?.get('body')
    expect(typeof body === 'string' ? JSON.parse(body) : null).toMatchObject({
      root: { type: 'root' },
    })
  })

  it('unpublishes a published article as a draft', async () => {
    const { saveArticle } = renderForm()

    await userEvent.click(screen.getByRole('button', { name: 'Unpublish' }))

    await waitFor(() => {
      expect(saveArticle.mock.calls[0]?.[0].get('status')).toBe('draft')
    })
  })

  it('offers publish and save as draft for a new article, dated today', () => {
    renderForm({ draft: null })

    expect(screen.getByRole('button', { name: 'Publish' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Save as draft' })).toBeInTheDocument()
    expect(screen.getByLabelText('Date')).toHaveValue(
      new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Berlin' }).format(new Date()),
    )
    expect(screen.getByText(/appears in English and German/)).toBeInTheDocument()
  })

  it('keeps text that only the admin can edit, and does not send it', async () => {
    const withUpload = { root: { ...BODY.root, children: [{ type: 'upload', version: 1 }] } }
    const { saveArticle } = renderForm({ draft: { ...DRAFT, body: withUpload } })

    expect(screen.getByText(/can only be edited in the admin panel/)).toBeInTheDocument()
    expect(screen.queryByRole('textbox', { name: 'Text' })).toBeNull()
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))
    await waitFor(() => {
      expect(saveArticle).toHaveBeenCalled()
    })
    expect(saveArticle.mock.calls[0]?.[0].has('body')).toBe(false)
  })

  it('marks invalid fields from the server and focuses the first one', async () => {
    renderForm({
      actions: {
        saveArticle: () =>
          Promise.resolve({ status: 'invalid', fieldErrors: { title: 'duplicateTitle' } }),
        uploadImage: vi.fn(),
      },
    })

    await userEvent.click(screen.getByRole('button', { name: 'Save' }))

    const title = screen.getByLabelText('Title')
    await waitFor(() => {
      expect(title).toHaveFocus()
    })
    expect(title).toHaveAccessibleDescription(/already exists/)
  })

  it('says when saving failed or the session ended', async () => {
    renderForm({
      actions: { saveArticle: () => Promise.resolve({ status: 'error' }), uploadImage: vi.fn() },
    })
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))
    expect(await screen.findByRole('alert')).toHaveTextContent(/Saving is not possible/)
  })

  it('uploads a new main image and removes images', async () => {
    const { uploadImage, saveArticle } = renderForm()

    await userEvent.upload(
      screen.getByLabelText(/^Main image/),
      new File(['x'], 'new.png', { type: 'image/png' }),
    )
    await waitFor(() => {
      expect(uploadImage).toHaveBeenCalled()
    })
    await userEvent.click(screen.getByRole('button', { name: 'Remove photo 1' }))
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => {
      expect(saveArticle).toHaveBeenCalled()
    })
    const formData = saveArticle.mock.calls[0]?.[0]
    expect(formData?.get('featuredImage')).toBe('40')
    expect(formData?.getAll('gallery')).toEqual([])
  })

  it('reports image problems and an ended session during upload', async () => {
    renderForm({
      actions: {
        saveArticle: vi.fn(),
        uploadImage: () => Promise.resolve({ status: 'invalid', reason: 'size' }),
      },
    })

    await userEvent.upload(
      screen.getByLabelText(/^Main image/),
      new File(['x'], 'huge.png', { type: 'image/png' }),
    )
    expect(await screen.findByText(/image is too large/)).toBeInTheDocument()
  })
})
