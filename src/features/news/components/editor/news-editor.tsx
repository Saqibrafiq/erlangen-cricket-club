'use client'

import { useLocale, useTranslations } from 'next-intl'
import { useCallback, useEffect, useState, useTransition } from 'react'

import { Link } from '@/i18n/navigation'
import { useRefreshThen } from '@/shared/lib/use-refresh-then'
import { Button } from '@/shared/ui/button'
import { ConfirmDialog } from '@/shared/ui/confirm-dialog'
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

type LoadState = { status: 'loading' } | NewsEditorResult<NewsDraft | null>
type FinishingProps = { isFinishing: boolean }

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
function EditNewsSheet({
  id,
  editing,
  onClose,
  onSaved,
  isFinishing,
}: { id: number | null } & Omit<NewsEditorProps, 'intent' | 'onDeleted'> & FinishingProps) {
  const t = useTranslations('news.editor')
  const locale = useLocale()
  const [state, setState] = useState<LoadState>(
    id === null ? { status: 'ok', data: null } : { status: 'loading' },
  )
  const { getArticle } = editing.actions

  const load = useCallback(() => {
    if (id === null) return
    setState({ status: 'loading' })
    void getArticle(id, locale).then(setState)
  }, [getArticle, id, locale])

  useEffect(() => {
    if (id === null) return
    let isCurrent = true
    void getArticle(id, locale).then((result) => {
      if (isCurrent) setState(result)
    })
    return () => {
      isCurrent = false
    }
  }, [getArticle, id, locale])

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
      {state.status === 'loading' && <FormSkeleton label={t('sheet.loading')} />}
      {state.status === 'unauthorized' && (
        <p role="alert" className="space-x-1">
          <span>{t('errors.unauthorized')}</span>
          <Link href={editing.loginHref} className="font-medium underline underline-offset-4">
            {t('errors.signIn')}
          </Link>
        </p>
      )}
      {state.status === 'error' && (
        <div role="alert" className="space-y-3">
          <p>{t('errors.load')}</p>
          <Button variant="secondary" onClick={load}>
            {t('errors.retry')}
          </Button>
        </div>
      )}
      {state.status === 'ok' && (
        <NewsForm
          draft={state.data}
          locale={locale}
          loginHref={editing.loginHref}
          actions={editing.actions}
          onSaved={onSaved}
          onCancel={onClose}
          isFinishing={isFinishing}
        />
      )}
    </Sheet>
  )
}

/** Asks before deleting; stays open with an error if it fails. */
function DeleteNewsDialog({
  id,
  title,
  editing,
  onClose,
  onDeleted,
  vanish,
  isFinishing,
}: { id: number; title: string } & Omit<NewsEditorProps, 'intent' | 'onSaved'> & FinishingProps) {
  const t = useTranslations('news.editor')
  const [isDeleting, startTransition] = useTransition()
  const [error, setError] = useState<string | undefined>()
  // Closed while the article vanishes, so the dialog doesn't hide the effect.
  const [isHidden, setIsHidden] = useState(false)
  const isPending = isDeleting || isFinishing

  return (
    <ConfirmDialog
      open={!isHidden}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose()
      }}
      title={t('deleteDialog.title', { title })}
      description={t('deleteDialog.description')}
      confirmLabel={isPending ? t('deleteDialog.deleting') : t('deleteDialog.confirm')}
      cancelLabel={t('deleteDialog.cancel')}
      isPending={isPending}
      error={error}
      onConfirm={() => {
        startTransition(async () => {
          const result = await editing.actions.deleteArticle(id)
          if (result.status === 'deleted') {
            setIsHidden(true)
            await vanish?.(id)
            onDeleted(title)
            return
          }
          setError(
            result.status === 'unauthorized' ? t('errors.unauthorized') : t('deleteDialog.error'),
          )
        })
      }}
    />
  )
}

/** The panel for writing or editing an article, or the dialog for deleting one. */
export function NewsEditor({ intent, leaveHref, onSaved, onDeleted, ...props }: NewsEditorProps) {
  const { refreshThen: refreshOrLeaveThen, isFinishing } = useRefreshThen()
  const refreshThen = (callback: () => void, leavesArticle: boolean) => {
    refreshOrLeaveThen(callback, leavesArticle ? leaveHref : undefined)
  }

  if (intent.kind === 'delete') {
    return (
      <DeleteNewsDialog
        id={intent.id}
        title={intent.title}
        isFinishing={isFinishing}
        onDeleted={(title) => {
          refreshThen(() => {
            onDeleted(title)
          }, true)
        }}
        {...props}
      />
    )
  }
  return (
    <EditNewsSheet
      id={intent.kind === 'edit' ? intent.id : null}
      isFinishing={isFinishing}
      onSaved={(article, title) => {
        refreshThen(() => {
          onSaved(article, title)
        }, !article.isPublished)
      }}
      {...props}
    />
  )
}
