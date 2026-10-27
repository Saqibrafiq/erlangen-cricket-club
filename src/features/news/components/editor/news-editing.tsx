'use client'

import dynamic from 'next/dynamic'
import { useTranslations } from 'next-intl'
import { createContext, type ReactNode, use, useEffect, useState } from 'react'

import { useIsEditMode } from '@/shared/lib/edit-mode'
import { EditActions } from '@/shared/ui/edit-actions'
import { EditorToolbar } from '@/shared/ui/editor-toolbar'

import type { DraftNews, NewsEditing, NewsEditorResult } from '../../editor-types'
import type { NewsIntent } from './news-editor'

// The editor (Lexical, forms) loads only once an editor opens it; visitors never download it.
const NewsEditor = dynamic(() => import('./news-editor').then((module) => module.NewsEditor), {
  ssr: false,
})

type NewsEditingContextValue = { open: (intent: NewsIntent) => void }

const NewsEditingContext = createContext<NewsEditingContextValue | null>(null)

export type NewsEditingProviderProps = {
  /** Editing actions; nothing changes for visitors, with or without them. */
  editing?: NewsEditing
  /**
   * `list`: the news page, with the toolbar (write, drafts). `article`: one article's page, which
   * leads back to `listHref` once the article is deleted or unpublished.
   */
  variant: 'list' | 'article'
  listHref: string
  children: ReactNode
}

function DraftsToolbar({
  getDrafts,
  refreshKey,
  open,
}: {
  getDrafts: NewsEditing['actions']['getDrafts']
  refreshKey: number
  open: NewsEditingContextValue['open']
}) {
  const t = useTranslations('news.editor')
  const [drafts, setDrafts] = useState<NewsEditorResult<DraftNews[]> | null>(null)

  useEffect(() => {
    let isCurrent = true
    void getDrafts().then((result) => {
      if (isCurrent) setDrafts(result)
    })
    return () => {
      isCurrent = false
    }
  }, [getDrafts, refreshKey])

  const items = drafts?.status === 'ok' ? drafts.data : []

  return (
    <EditorToolbar
      addLabel={t('add')}
      onAdd={() => {
        open({ kind: 'add' })
      }}
      error={drafts?.status === 'error' ? t('errors.draftsLoad') : undefined}
      hidden={{
        summary: t('drafts.summary', { count: items.length }),
        hint: t('drafts.hint'),
        items: items.map((draft) => ({ id: draft.id, label: draft.title })),
        editLabel: (item) => t('edit', { title: item.label }),
        onEdit: (id) => {
          open({ kind: 'edit', id })
        },
      }}
    />
  )
}

/**
 * Edit mode for news: in an editor's browser it adds the toolbar (list), the notices and one
 * shared editor that the articles' edit and delete buttons open. For visitors it renders only its
 * children, which stay the static, server-rendered articles.
 */
export function NewsEditingProvider({
  editing,
  variant,
  listHref,
  children,
}: NewsEditingProviderProps) {
  const t = useTranslations('news.editor')
  const isEditMode = useIsEditMode()
  const [intent, setIntent] = useState<NewsIntent | null>(null)
  const [notice, setNotice] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)

  if (!isEditMode || !editing) {
    return children
  }

  const finish = (message: string) => {
    setIntent(null)
    setNotice(message)
    setRefreshKey((key) => key + 1)
  }

  return (
    <NewsEditingContext value={{ open: setIntent }}>
      <div className="space-y-6">
        {variant === 'list' && (
          <DraftsToolbar
            getDrafts={editing.actions.getDrafts}
            refreshKey={refreshKey}
            open={setIntent}
          />
        )}
        <p role="status" className="text-sm font-medium text-brand-primary empty:hidden">
          {notice}
        </p>
        {children}
      </div>
      {intent && (
        <NewsEditor
          intent={intent}
          editing={editing}
          // On an article's own page, a deleted or unpublished article is gone: back to the list.
          leaveHref={variant === 'article' ? listHref : undefined}
          onClose={() => {
            setIntent(null)
          }}
          onSaved={(article, title) => {
            finish(t(article.isPublished ? 'notice.published' : 'notice.draft', { title }))
          }}
          onDeleted={(title) => {
            finish(t('notice.deleted', { title }))
          }}
        />
      )}
    </NewsEditingContext>
  )
}

export type NewsEditActionsProps = {
  id: number
  title: string
  className?: string
}

/** Edit and delete buttons for one article; nothing outside edit mode. */
export function NewsEditActions({ id, title, className }: NewsEditActionsProps) {
  const t = useTranslations('news.editor')
  const context = use(NewsEditingContext)
  if (!context) {
    return null
  }

  return (
    <EditActions
      editLabel={t('edit', { title })}
      deleteLabel={t('delete', { title })}
      onEdit={() => {
        context.open({ kind: 'edit', id })
      }}
      onDelete={() => {
        context.open({ kind: 'delete', id, title })
      }}
      className={className}
    />
  )
}
