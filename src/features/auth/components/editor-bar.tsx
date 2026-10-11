'use client'

import { LogOut, PencilLine, Settings } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useTransition } from 'react'

import { useIsEditMode } from '@/shared/lib/edit-mode'
import { Container } from '@/shared/ui/container'

import { ADMIN_PATH } from '../domain/sign-in'

export type EditorBarProps = {
  /** Server action that ends the session (`signOutAction`). */
  signOut: () => Promise<void>
}

const LINK_CLASS =
  'inline-flex min-h-9 items-center gap-1.5 rounded-md px-2 font-medium underline-offset-4 hover:underline disabled:opacity-60 [&_svg]:size-4'

/**
 * A slim bar under the header while an editor is signed in: says edit mode is on, links to the
 * full admin and signs out. Renders nothing for visitors.
 */
export function EditorBar({ signOut }: EditorBarProps) {
  const t = useTranslations('auth.editorBar')
  const isEditor = useIsEditMode()
  const [isPending, startTransition] = useTransition()

  if (!isEditor) {
    return null
  }

  return (
    <div className="border-b border-brand-primary/20 bg-brand-primary text-brand-on-primary">
      <Container className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 py-1 text-sm">
        <p className="inline-flex items-center gap-2 font-semibold">
          <PencilLine aria-hidden="true" className="size-4" />
          {t('status')}
        </p>
        <div className="flex items-center gap-1">
          {/* A plain link: the admin is another app, so a full page load is right. */}
          <a href={ADMIN_PATH} className={LINK_CLASS}>
            <Settings aria-hidden="true" />
            {t('admin')}
          </a>
          <button
            type="button"
            disabled={isPending}
            aria-busy={isPending}
            onClick={() => {
              startTransition(async () => {
                await signOut()
                // Reload as a visitor: the static page without editing controls.
                window.location.reload()
              })
            }}
            className={LINK_CLASS}
          >
            <LogOut aria-hidden="true" />
            {t('signOut')}
          </button>
        </div>
      </Container>
    </div>
  )
}
