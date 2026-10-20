import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent, within } from 'storybook/test'

import type { NewsDraft, SaveNewsResult } from '../../editor-types'
import { AGM_ARTICLE } from '../../test-factories'
import { NewsForm } from './news-form'

function respondWith(result: SaveNewsResult) {
  return () => Promise.resolve(result)
}

const DRAFT: NewsDraft = {
  id: AGM_ARTICLE.id,
  slug: AGM_ARTICLE.slug,
  title: AGM_ARTICLE.title,
  excerpt: AGM_ARTICLE.excerpt,
  body: AGM_ARTICLE.body,
  publishedAt: '2024-12-19',
  featuredImage: null,
  featuredImageStyle: 'photo',
  gallery: [],
  status: 'published',
}

const meta = {
  title: 'News/Editor/NewsForm',
  component: NewsForm,
  args: {
    draft: null,
    locale: 'en',
    loginHref: '/login',
    actions: {
      saveArticle: respondWith({
        status: 'saved',
        article: { id: 9, slug: 'new', isPublished: true },
      }),
      uploadImage: () => Promise.resolve({ status: 'error' }),
    },
    onSaved: () => undefined,
    onCancel: () => undefined,
  },
  decorators: [
    (Story) => (
      <div className="max-w-3xl p-6">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof NewsForm>

export default meta

type Story = StoryObj<typeof meta>

/** Writing a new article: publish or save as draft. */
export const NewArticle: Story = {}

/** Editing a published article: save or unpublish. */
export const EditArticle: Story = { args: { draft: DRAFT } }

export const EditDraft: Story = { args: { draft: { ...DRAFT, status: 'draft' } } }

/** Text with content only the admin can edit stays read-only here. */
export const TextOnlyInAdmin: Story = {
  args: {
    draft: {
      ...DRAFT,
      body: { root: { ...DRAFT.body.root, children: [{ type: 'upload', version: 1 }] } },
    },
  },
}

export const DuplicateTitle: Story = {
  args: {
    draft: DRAFT,
    actions: {
      saveArticle: respondWith({ status: 'invalid', fieldErrors: { title: 'duplicateTitle' } }),
      uploadImage: () => Promise.resolve({ status: 'error' }),
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: 'Save' }))
    await expect(await canvas.findByText(/already exists/)).toBeVisible()
  },
}

export const Saving: Story = { args: { draft: DRAFT, isFinishing: true } }
