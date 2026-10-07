import { describe, expect, it } from 'vitest'

import { siteConfig } from '@/shared/config/site'

import { AGM_ARTICLE } from '../test-factories'
import { buildNewsArticleJsonLd } from './news-article-json-ld'

const URL = `${siteConfig.url}/news/annual-general-meeting-2024-key-takeaways`

describe('buildNewsArticleJsonLd', () => {
  it('describes the article with dates, page URL and the club as author and publisher', () => {
    const jsonLd = buildNewsArticleJsonLd(AGM_ARTICLE, URL)

    expect(jsonLd).toMatchObject({
      '@type': 'NewsArticle',
      headline: AGM_ARTICLE.title,
      description: AGM_ARTICLE.excerpt,
      datePublished: AGM_ARTICLE.publishedAt,
      dateModified: AGM_ARTICLE.updatedAt,
      url: URL,
      author: { name: siteConfig.name },
      publisher: { name: siteConfig.name },
    })
  })

  it('lists the featured image and gallery photos as absolute URLs', () => {
    expect(buildNewsArticleJsonLd(AGM_ARTICLE, URL).image).toEqual([
      `${siteConfig.url}/api/media/file/agm-2024-1.jpg`,
      `${siteConfig.url}/api/media/file/agm-2024-4.jpg`,
    ])
  })

  it('keeps absolute image URLs (e.g. from Vercel Blob) as they are', () => {
    const blobUrl = 'https://blob.example.com/agm.jpg'
    const article = {
      ...AGM_ARTICLE,
      image: AGM_ARTICLE.image && { ...AGM_ARTICLE.image, url: blobUrl },
      gallery: [],
    }

    expect(buildNewsArticleJsonLd(article, URL).image).toEqual([blobUrl])
  })

  it('omits images when the article has none', () => {
    const article = { ...AGM_ARTICLE, image: null, gallery: [] }

    expect(buildNewsArticleJsonLd(article, URL)).not.toHaveProperty('image')
  })
})
