'use client'

import { useLocale, useTranslations } from 'next-intl'
import { useCallback } from 'react'

import { useEditorLoad } from '@/shared/lib/use-editor-load'
import { useRefreshThen } from '@/shared/lib/use-refresh-then'
import { DeleteConfirmDialog } from '@/shared/ui/delete-confirm-dialog'
import { EditorLoadView } from '@/shared/ui/editor-load-view'
import { Sheet } from '@/shared/ui/sheet'
import { Skeleton } from '@/shared/ui/skeleton'

import type { NewsDraft, NewsEditing, NewsEditorResult } from '../../editor-types'
import { NewsForm, type SavedArticle } from './news-form'

/** What the editor was asked to do. */
export type NewsIntent =
  { kind: 'add' } | { kind: 'edit'; id: number } | { kind: 'delete'; id: number; title: string }

export type NewsEditorProps = {
  intent: NewsIntent
  editing: NewsEditing
  /** Where to go once the article is deleted or unpublished (from its own page); else stay. */
  leaveHref?: string
  onClose: () => void
  /** Called after the page has been refreshed with the change. */
  onSaved: (article: SavedArticle, title: string) => void
  /** Called after the page has been refreshed without the article. */
  onDeleted: (title: string) => void
  /** Plays the item's delete effect; deleting waits for it before refreshing the page. */
  vanish?: (id: number) => Promise<void>
}

type EditNewsSheetProps = {
  id: number | null
  editing: NewsEditing
  onClose: () => void
  onSaved: (article: SavedArticle, title: string) => void
  /** True while the page is fetched again after the save; the form stays busy meanwhile. */
  isFinishing: boolean
}

/** A new article has nothing to load: the empty form shows at once. */
const NEW_ARTICLE = { status: 'ok', data: null } as const

function FormSkeleton({ label }: { label: string }) {
  return (
    <div role="status" aria-label={label} className="space-y-5">
      <Skeleton className="h-11 w-full" />
      <Skeleton className="h-16 w-full" />
      <Skeleton className="aspect-video w-48" />
      <Skeleton className="h-56 w-full" />
    </div>
  )
}

/** Loads the article (nothing to load for a new one) and shows the form in a wide panel. */
function EditNewsSheet({ id, editing, onClose, onSaved, isFinishing }: EditNewsSheetProps) {
  const t = useTranslations('news.editor')
  const locale = useLocale()
  const { getArticle } = editing.actions
  const loadArticle = useCallback(
    (): Promise<NewsEditorResult<NewsDraft | null>> =>
      id === null ? Promise.resolve(NEW_ARTICLE) : getArticle(id, locale),
    [getArticle, id, locale],
  )
  const { state, reload } = useEditorLoad(loadArticle, id === null ? NEW_ARTICLE : undefined)

  return (
    <Sheet
      open
      size="wide"
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose()
      }}
      title={id === null ? t('sheet.addTitle') : t('sheet.editTitle')}
      closeLabel={t('sheet.close')}
    >
      <EditorLoadView
        state={state}
        skeleton={<FormSkeleton label={t('sheet.loading')} />}
        loadError={t('errors.load')}
        signInHref={editing.loginHref}
        onRetry={reload}
      >
        {(draft) => (
          <NewsForm
            draft={draft}
            locale={locale}
            loginHref={editing.loginHref}
            actions={editing.actions}
            onSaved={onSaved}
            onCancel={onClose}
            isFinishing={isFinishing}
          />
        )}
      </EditorLoadView>
    </Sheet>
  )
}

/** The panel for writing or editing an article, or the dialog for deleting one. */
export function NewsEditor({
  intent,
  editing,
  leaveHref,
  onClose,
  onSaved,
  onDeleted,
  vanish,
}: NewsEditorProps) {
  const t = useTranslations('news.editor')
  const { refreshThen: refreshOrLeaveThen, isFinishing } = useRefreshThen()
  const refreshThen = (callback: () => void, leavesArticle: boolean) => {
    refreshOrLeaveThen(callback, leavesArticle ? leaveHref : undefined)
  }

  if (intent.kind === 'delete') {
    const { id, title } = intent
    return (
      <DeleteConfirmDialog
        title={t('deleteDialog.title', { title })}
        description={t('deleteDialog.description')}
        onDelete={() => editing.actions.deleteArticle(id)}
        vanish={vanish && (() => vanish(id))}
        onDeleted={() => {
          refreshThen(() => {
            onDeleted(title)
          }, true)
        }}
        onClose={onClose}
        isFinishing={isFinishing}
      />
    )
  }
  return (
    <EditNewsSheet
      id={intent.kind === 'edit' ? intent.id : null}
      editing={editing}
      onClose={onClose}
      onSaved={(article, title) => {
        refreshThen(() => {
          onSaved(article, title)
        }, !article.isPublished)
      }}
      isFinishing={isFinishing}
    />
  )
}
