import { useTranslations } from 'next-intl'

import type { NewsSummary } from '../types'
import { NewsCard } from './news-card'

export type NewsListProps = {
  articles: readonly NewsSummary[]
}

/**
 * All articles, newest first; the latest leads across the full width. Cards stretch to fill their
 * row and switch to a side-by-side layout when wide. Sits below the page's h1.
 */
export function NewsList({ articles }: NewsListProps) {
  const t = useTranslations('news')

  if (articles.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border-default p-4 text-text-muted">
        {t('empty')}
      </p>
    )
  }

  const [lead, ...others] = articles

  return (
    <div className="space-y-6">
      {lead && <NewsCard article={lead} isLead />}
      {others.length > 0 && (
        <div className="grid grid-cols-cards-fit gap-6">
          {others.map((article) => (
            <NewsCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </div>
  )
}
