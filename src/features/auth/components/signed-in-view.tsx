'use client'

import { LogOut, PencilLine } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState, useTransition } from 'react'

import { Button } from '@/shared/ui/button'

import type { EditModeResult } from '../sign-in-state'
import { AuthCard } from './auth-card'

export type SignedInViewProps = {
  email: string
  /** Page to open in edit mode. */
  redirectTo: string
  enterEditMode: () => Promise<EditModeResult>
  signOut: () => Promise<void>
}

/**
 * Shown instead of the form when the editor is already signed in (for example in the admin, or
 * before edit mode existed): switch edit mode on for this browser, or sign out.
 */
export function SignedInView({ email, redirectTo, enterEditMode, signOut }: SignedInViewProps) {
  const t = useTranslations('auth.signedIn')
  const [isPending, startTransition] = useTransition()
  const [hasFailed, setHasFailed] = useState(false)

  return (
    <AuthCard title={t('title')} intro={t('intro', { email })}>
      <div className="space-y-3">
        {hasFailed && (
          <p
            role="alert"
            className="rounded-lg bg-status-danger-surface p-3 text-sm font-medium text-status-danger-text"
          >
            {t('expired')}
          </p>
        )}
        <Button
          size="lg"
          className="w-full"
          disabled={isPending}
          aria-busy={isPending}
          onClick={() => {
            startTransition(async () => {
              const result = await enterEditMode()
              if (result.status === 'ok') {
                window.location.assign(redirectTo)
                return
              }
              setHasFailed(true)
            })
          }}
        >
          <PencilLine aria-hidden="true" />
          {t('editMode')}
        </Button>
        <Button
          size="lg"
          variant="secondary"
          className="w-full"
          disabled={isPending}
          onClick={() => {
            startTransition(async () => {
              await signOut()
              window.location.reload()
            })
          }}
        >
          <LogOut aria-hidden="true" />
          {t('signOut')}
        </Button>
      </div>
    </AuthCard>
  )
}
