import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'

import {
  buildNewsArticleJsonLd,
  getNewsArticle,
  getNewsEntries,
  getNewsPath,
  NEWS_PATH,
  NewsArticleView,
} from '@/features/news'
import { resolveLocale } from '@/i18n/locale'
import { getLocalizedPath } from '@/i18n/routing'
import { siteConfig } from '@/shared/config/site'
import { buildAlternates, buildBreadcrumbJsonLd } from '@/shared/lib/seo'
import { Breadcrumbs } from '@/shared/ui/breadcrumbs'
import { Container } from '@/shared/ui/container'
import { JsonLd } from '@/shared/ui/json-ld'

type NewsArticlePageProps = PageProps<'/[locale]/news/[slug]'>

export async function generateStaticParams() {
  const entries = await getNewsEntries()
  return entries.map(({ slug }) => ({ slug }))
}

async function loadArticle(params: NewsArticlePageProps['params']) {
  const [locale, { slug }] = await Promise.all([resolveLocale(params), params])
  const article = await getNewsArticle(slug, locale)

  if (!article) {
    notFound()
  }

  return { locale, article }
}

export async function generateMetadata({ params }: NewsArticlePageProps): Promise<Metadata> {
  const { locale, article } = await loadArticle(params)

  return {
    title: article.title,
    description: article.excerpt,
    alternates: buildAlternates(getNewsPath(article.slug), locale),
    openGraph: {
      type: 'article',
      title: article.title,
      description: article.excerpt,
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt,
      ...(article.image ? { images: [{ url: article.image.url, alt: article.image.alt }] } : {}),
    },
  }
}

export default async function NewsArticlePage({ params }: NewsArticlePageProps) {
  const { locale, article } = await loadArticle(params)
  const tNavigation = await getTranslations({ locale, namespace: 'navigation' })
  const path = getNewsPath(article.slug)

  return (
    <Container width="prose" className="space-y-6 py-10">
      <Breadcrumbs
        items={[{ label: tNavigation('news'), href: NEWS_PATH }, { label: article.title }]}
      />
      <NewsArticleView article={article} />
      <JsonLd
        data={buildNewsArticleJsonLd(article, `${siteConfig.url}${getLocalizedPath(path, locale)}`)}
      />
      <JsonLd
        data={buildBreadcrumbJsonLd(
          [
            { name: tNavigation('news'), pathname: NEWS_PATH },
            { name: article.title, pathname: path },
          ],
          locale,
        )}
      />
    </Container>
  )
}
