import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { AGM_ARTICLE, SPONSOR_NEWS } from '../test-factories'
import { NewsArticleView } from './news-article-view'

const meta = {
  title: 'News/NewsArticleView',
  component: NewsArticleView,
  args: { article: AGM_ARTICLE },
  decorators: [
    (Story) => (
      <div className="max-w-3xl">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof NewsArticleView>

export default meta

type Story = StoryObj<typeof meta>

/** Featured photo, body and gallery. */
export const WithPhotos: Story = {}

/** A sponsor logo after the heading, shown whole on a light panel. */
export const WithSponsorLogo: Story = {
  args: {
    article: { ...AGM_ARTICLE, image: SPONSOR_NEWS.image, imageStyle: 'logo', gallery: [] },
  },
}

export const WithoutImages: Story = {
  args: { article: { ...AGM_ARTICLE, image: null, gallery: [] } },
}
