import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { AGM_NEWS, SPONSOR_NEWS } from '../test-factories'
import { NewsList } from './news-list'

const meta = {
  title: 'News/NewsList',
  component: NewsList,
  args: { articles: [SPONSOR_NEWS, AGM_NEWS] },
} satisfies Meta<typeof NewsList>

export default meta

type Story = StoryObj<typeof meta>

/** Lead story (sponsor logo) and a photo story; a lone card fills its row. */
export const TwoArticles: Story = {}

export const ManyArticles: Story = {
  args: {
    articles: [SPONSOR_NEWS, ...[2, 3, 4, 5].map((id) => ({ ...AGM_NEWS, id, slug: `agm-${id}` }))],
  },
}

/** Articles without an image keep the card shape with a club-branded panel. */
export const WithoutImages: Story = {
  args: {
    articles: [
      { ...SPONSOR_NEWS, image: null },
      { ...AGM_NEWS, image: null },
    ],
  },
}

export const Empty: Story = { args: { articles: [] } }
