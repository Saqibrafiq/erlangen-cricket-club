'use client'

import { useTranslations } from 'next-intl'
import { type SubmitEvent, useId, useState, useTransition } from 'react'

import { Link } from '@/i18n/navigation'
import { Button } from '@/shared/ui/button'
import { FormField, formControlClassName } from '@/shared/ui/form-field'
import { Sheet } from '@/shared/ui/sheet'

import { type Account, ACCOUNT_NAME_MAX_LENGTH } from '../domain/account'
import type { AccountActions, SaveAccountResult } from '../sign-in-state'

/** Payload's own account page, where the password is changed. */
const ADMIN_ACCOUNT_PATH = '/admin/account'

export type ProfileSheetProps = {
  account: Account
  loginHref: string
  save: AccountActions['saveAccount']
  onClose: () => void
  onSaved: (account: Account) => void
}

/** Edits the signed-in editor's own name and email; the password is changed in the admin. */
export function ProfileSheet({ account, loginHref, save, onClose, onSaved }: ProfileSheetProps) {
  const t = useTranslations('auth.profile')
  const id = useId()
  const [result, setResult] = useState<SaveAccountResult | null>(null)
  const [isSaving, startTransition] = useTransition()
  const fieldErrors = result?.status === 'invalid' ? result.fieldErrors : {}
  const errorFor = (field: keyof typeof fieldErrors) => {
    const code = fieldErrors[field]
    return code ? t(`errors.${code}`) : undefined
  }

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    startTransition(async () => {
      const saved = await save(formData)
      if (saved.status === 'saved') {
        onSaved(saved.account)
        return
      }
      setResult(saved)
    })
  }

  return (
    <Sheet
      open
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose()
      }}
      title={t('title')}
      description={t('description')}
      closeLabel={t('close')}
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        {result?.status === 'error' && (
          <p
            role="alert"
            className="rounded-lg bg-status-danger-surface p-3 text-sm font-medium text-status-danger-text"
          >
            {t('errors.server')}
          </p>
        )}
        {result?.status === 'unauthorized' && (
          <p
            role="alert"
            className="rounded-lg bg-status-danger-surface p-3 text-sm font-medium text-status-danger-text"
          >
            {t('errors.unauthorized')}{' '}
            <Link href={loginHref} className="underline underline-offset-4">
              {t('errors.signIn')}
            </Link>
          </p>
        )}
        <FormField
          id={`${id}-name`}
          label={t('name')}
          hint={t('nameHint')}
          error={errorFor('name')}
        >
          {(control) => (
            <input
              {...control}
              name="name"
              required
              autoComplete="name"
              maxLength={ACCOUNT_NAME_MAX_LENGTH}
              defaultValue={account.name ?? ''}
              className={formControlClassName}
            />
          )}
        </FormField>
        <FormField
          id={`${id}-email`}
          label={t('email')}
          hint={t('emailHint')}
          error={errorFor('email')}
        >
          {(control) => (
            <input
              {...control}
              name="email"
              type="email"
              required
              autoComplete="email"
              defaultValue={account.email}
              className={formControlClassName}
            />
          )}
        </FormField>
        <p className="text-sm text-text-muted">
          {t('password')}{' '}
          {/* A plain link: the admin is another app, so a full page load is right. */}
          <a
            href={ADMIN_ACCOUNT_PATH}
            className="font-medium text-brand-primary underline-offset-4 hover:underline"
          >
            {t('passwordLink')}
          </a>
        </p>

        <div className="sticky bottom-0 -mx-6 flex justify-end gap-3 border-t border-border-default bg-surface-default px-6 py-4">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSaving}>
            {t('cancel')}
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? t('saving') : t('save')}
          </Button>
        </div>
      </form>
    </Sheet>
  )
}
