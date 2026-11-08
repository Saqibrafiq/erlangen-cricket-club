'use client'

import { Check, Eye, EyeOff, LoaderCircle } from 'lucide-react'
import { useAnimate, useReducedMotion } from 'motion/react'
import { useTranslations } from 'next-intl'
import { useActionState, useEffect, useId, useRef, useState } from 'react'

import { Button } from '@/shared/ui/button'
import { FormField, formControlClassName } from '@/shared/ui/form-field'
import { Alert } from '@/shared/ui/alert'

import { EMAIL_MAX_LENGTH, PASSWORD_MAX_LENGTH, type SignInField } from '../domain/sign-in'
import { REDIRECT_PARAM } from '../paths'
import { INITIAL_SIGN_IN_STATE, type SignInState } from '../sign-in-state'
import { rememberWelcome } from './welcome'

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
  const [formRef, animate] = useAnimate<HTMLFormElement>()
  const prefersReducedMotion = useReducedMotion()
  const passwordRef = useRef<HTMLInputElement>(null)
  const id = useId()

  // Each result is handled once: the effect also re-runs when its other inputs settle after
  // mount, which must not shake twice or load the next page a second time.
  const handledState = useRef<SignInState>(INITIAL_SIGN_IN_STATE)

  // Move focus to what needs fixing: the first invalid field, or the password to type again.
  useEffect(() => {
    if (handledState.current === state) {
      return
    }
    handledState.current = state
    if (state.status === 'invalid') {
      formRef.current.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()
    }
    if (state.status === 'rejected') {
      passwordRef.current?.focus()
      // A short shake says "try again" at a glance; the message says why.
      if (!prefersReducedMotion) {
        void animate(formRef.current, { x: [0, -8, 8, -6, 6, -3, 0] }, { duration: 0.4 })
      }
    }
    if (state.status === 'success') {
      rememberWelcome()
      window.location.assign(state.redirectTo)
    }
  }, [state, animate, formRef, prefersReducedMotion])

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
      {alert && <Alert>{t(`errors.${alert}`)}</Alert>}

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
        {state.status === 'success' ? (
          <>
            <Check aria-hidden="true" />
            {t('signedIn')}
          </>
        ) : isPending ? (
          <>
            <LoaderCircle aria-hidden="true" className="motion-safe:animate-spin" />
            {t('submitting')}
          </>
        ) : (
          t('submit')
        )}
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
