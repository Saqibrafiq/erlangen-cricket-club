import { useTranslations } from 'next-intl'

import type { NewsEditing } from '../editor-types'
import { NEWS_PATH } from '../paths'
import type { NewsSummary } from '../types'
import { NewsEditingProvider } from './editor/news-editing'
import { NewsCard } from './news-card'

export type NewsListProps = {
  articles: readonly NewsSummary[]
  /** Editing actions; the controls show only in a signed-in editor's browser. */
  editing?: NewsEditing
}

/**
 * All articles, newest first; the latest leads across the full width. Cards stretch to fill their
 * row and switch to a side-by-side layout when wide. Sits below the page's h1.
 */
export function NewsList({ articles, editing }: NewsListProps) {
  const t = useTranslations('news')
  const [lead, ...others] = articles

  return (
    <NewsEditingProvider editing={editing} variant="list" listHref={NEWS_PATH}>
      {lead ? (
        <div className="space-y-6">
          <NewsCard article={lead} isLead />
          {others.length > 0 && (
            <div className="grid grid-cols-cards-fit gap-6">
              {others.map((article) => (
                <NewsCard key={article.id} article={article} />
              ))}
            </div>
          )}
        </div>
      ) : (
        <p className="rounded-xl border border-dashed border-border-default p-4 text-text-muted">
          {t('empty')}
        </p>
      )}
    </NewsEditingProvider>
  )
}
