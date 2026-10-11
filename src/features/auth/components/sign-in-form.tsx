'use client'

import { Eye, EyeOff } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useActionState, useEffect, useId, useRef, useState } from 'react'

import { Button } from '@/shared/ui/button'
import { FormField, formControlClassName } from '@/shared/ui/form-field'

import { EMAIL_MAX_LENGTH, PASSWORD_MAX_LENGTH, type SignInField } from '../domain/sign-in'
import { REDIRECT_PARAM } from '../paths'
import { INITIAL_SIGN_IN_STATE, type SignInState } from '../sign-in-state'

export type SignInFormProps = {
  /** Server action that signs in (`signInAction`). */
  action: (state: SignInState, formData: FormData) => Promise<SignInState>
  /** Admin page to open afterwards; validated again on the server. */
  redirectTo: string
}

/** Email and password, with a show-password toggle; errors are announced and focused. */
export function SignInForm({ action, redirectTo }: SignInFormProps) {
  const t = useTranslations('auth.signIn')
  const [state, formAction, isPending] = useActionState(action, INITIAL_SIGN_IN_STATE)
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)
  const id = useId()

  // Move focus to what needs fixing: the first invalid field, or the password to type again.
  useEffect(() => {
    if (state.status === 'invalid') {
      formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()
    }
    if (state.status === 'rejected') {
      passwordRef.current?.focus()
    }
    if (state.status === 'success') {
      window.location.assign(state.redirectTo)
    }
  }, [state])

  const fieldErrors = state.status === 'invalid' ? state.fieldErrors : {}
  const email = state.status === 'idle' || state.status === 'success' ? undefined : state.email
  const fieldId = (field: SignInField) => `${id}-${field}`
  const errorFor = (field: SignInField) => {
    const code = fieldErrors[field]
    return code ? t(`errors.${code}`) : undefined
  }
  const alert = getAlert(state)
  // Stays busy after success while the next page loads.
  const isBusy = isPending || state.status === 'success'

  return (
    <form ref={formRef} action={formAction} noValidate className="space-y-5">
      {alert && (
        <p
          role="alert"
          className="rounded-lg bg-status-danger-surface p-3 text-sm font-medium text-status-danger-text"
        >
          {t(`errors.${alert}`)}
        </p>
      )}

      <input type="hidden" name={REDIRECT_PARAM} value={redirectTo} />

      <FormField id={fieldId('email')} label={t('email')} error={errorFor('email')}>
        {(control) => (
          <input
            {...control}
            name="email"
            type="email"
            autoComplete="username"
            required
            maxLength={EMAIL_MAX_LENGTH}
            defaultValue={email}
            className={formControlClassName}
          />
        )}
      </FormField>

      <FormField id={fieldId('password')} label={t('password')} error={errorFor('password')}>
        {(control) => (
          <div className="relative">
            <input
              {...control}
              ref={passwordRef}
              name="password"
              type={isPasswordVisible ? 'text' : 'password'}
              autoComplete="current-password"
              required
              maxLength={PASSWORD_MAX_LENGTH}
              className={`${formControlClassName} pr-12`}
            />
            <button
              type="button"
              onClick={() => {
                setIsPasswordVisible((isVisible) => !isVisible)
              }}
              aria-pressed={isPasswordVisible}
              aria-controls={control.id}
              aria-label={t('showPassword')}
              className="absolute inset-y-0 right-0 inline-flex w-11 items-center justify-center rounded-r-lg text-text-muted transition-colors duration-150 hover:text-text-default"
            >
              {isPasswordVisible ? (
                <EyeOff aria-hidden="true" className="size-5" />
              ) : (
                <Eye aria-hidden="true" className="size-5" />
              )}
            </button>
          </div>
        )}
      </FormField>

      <Button type="submit" size="lg" disabled={isBusy} aria-busy={isBusy} className="w-full">
        {isBusy ? t('submitting') : t('submit')}
      </Button>
    </form>
  )
}

type AlertCode = 'summary' | 'credentials' | 'locked' | 'server'

function getAlert(state: SignInState): AlertCode | null {
  switch (state.status) {
    case 'invalid':
      return 'summary'
    case 'rejected':
      return state.reason
    case 'error':
      return 'server'
    default:
      return null
  }
}
