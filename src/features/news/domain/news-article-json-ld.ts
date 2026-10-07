import { siteConfig } from '@/shared/config/site'

import type { NewsArticle } from '../types'

function toAbsoluteUrl(url: string): string {
  return url.startsWith('http') ? url : `${siteConfig.url}${url}`
}

/** schema.org `NewsArticle` for an article page; `url` is its absolute, localised address. */
export function buildNewsArticleJsonLd(article: NewsArticle, url: string) {
  const club = { '@type': 'SportsOrganization', name: siteConfig.name, url: siteConfig.url }
  const images = [article.image, ...article.gallery]
    .filter((image) => image !== null)
    .map((image) => toAbsoluteUrl(image.url))

  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article.title,
    description: article.excerpt,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt,
    mainEntityOfPage: url,
    url,
    author: club,
    publisher: club,
    ...(images.length > 0 ? { image: images } : {}),
  }
}
