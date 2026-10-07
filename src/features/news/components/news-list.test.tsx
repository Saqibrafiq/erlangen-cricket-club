import { screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { renderWithIntl } from '@/shared/testing/render-with-intl'

import { AGM_ARTICLE, AGM_NEWS, SPONSOR_NEWS } from '../test-factories'
import { NewsArticleView } from './news-article-view'
import { NewsList } from './news-list'
import { NewsSkeleton } from './news-skeleton'

describe('NewsList', () => {
  it('shows each article as a card linking to it, newest first', () => {
    renderWithIntl(<NewsList articles={[SPONSOR_NEWS, AGM_NEWS]} />)

    const [first, second] = screen.getAllByRole('article')
    expect(within(first ?? document.body).getByRole('link')).toHaveAttribute(
      'href',
      '/news/new-sponsor-ovb-finanzberater-denis-martin',
    )
    expect(second).toHaveTextContent(AGM_NEWS.title)
  })

  it('shows publish date, excerpt and image with alt text', () => {
    renderWithIntl(<NewsList articles={[SPONSOR_NEWS]} />)

    const card = screen.getByRole('article')
    expect(within(card).getByText('June 12, 2025')).toHaveAttribute(
      'datetime',
      SPONSOR_NEWS.publishedAt,
    )
    expect(within(card).getByText(SPONSOR_NEWS.excerpt)).toBeInTheDocument()
    expect(within(card).getByRole('img', { name: 'OVB logo' })).toBeInTheDocument()
  })

  it('keeps the card shape without an image', () => {
    renderWithIntl(<NewsList articles={[{ ...AGM_NEWS, image: null }]} />)

    expect(screen.queryByRole('img')).toBeNull()
    expect(screen.getByRole('heading', { name: AGM_NEWS.title })).toBeInTheDocument()
  })

  it('shows an empty state without articles', () => {
    renderWithIntl(<NewsList articles={[]} />)

    expect(screen.getByText('No news yet. Check back soon.')).toBeInTheDocument()
  })
})

describe('NewsArticleView', () => {
  it('shows the title as the page heading, then the featured image and body', () => {
    renderWithIntl(<NewsArticleView article={AGM_ARTICLE} />)

    expect(screen.getByRole('heading', { level: 1, name: AGM_ARTICLE.title })).toBeVisible()
    expect(screen.getByRole('img', { name: AGM_ARTICLE.image?.alt })).toBeInTheDocument()
    expect(
      screen.getByText('The meeting concluded with renewed excitement for the future.'),
    ).toBeInTheDocument()
  })

  it('shows further photos in a gallery linking to the full-size image', () => {
    renderWithIntl(<NewsArticleView article={AGM_ARTICLE} />)

    const gallery = screen.getByRole('region', { name: 'Photos' })
    expect(within(gallery).getByRole('link')).toHaveAttribute(
      'href',
      '/api/media/file/agm-2024-4.jpg',
    )
  })

  it('has no gallery without further photos', () => {
    renderWithIntl(<NewsArticleView article={{ ...AGM_ARTICLE, gallery: [] }} />)

    expect(screen.queryByRole('region', { name: 'Photos' })).toBeNull()
  })

  it('shows a sponsor logo whole', () => {
    renderWithIntl(
      <NewsArticleView
        article={{ ...AGM_ARTICLE, image: SPONSOR_NEWS.image, imageStyle: 'logo' }}
      />,
    )

    expect(screen.getByRole('img', { name: 'OVB logo' })).toHaveClass('object-contain')
  })
})

describe('NewsSkeleton', () => {
  it('announces loading', () => {
    renderWithIntl(<NewsSkeleton />)

    expect(screen.getByRole('status')).toHaveTextContent('Loading…')
  })
})
