'use client'

import { CheckCircle2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useActionState, useEffect, useId, useRef } from 'react'

import { Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routing'
import { Button } from '@/shared/ui/button'
import { FormField, formControlClassName } from '@/shared/ui/form-field'

import { INITIAL_CONTACT_STATE, type ContactFormState } from '../contact-form-state'
import {
  CONTACT_TOPICS,
  HONEYPOT_FIELD,
  MESSAGE_MAX_LENGTH,
  NAME_MAX_LENGTH,
  type ContactField,
} from '../domain/contact-message'

export type ContactFormProps = {
  /** Server action that stores the message (`submitContactMessageAction`). */
  action: (state: ContactFormState, formData: FormData) => Promise<ContactFormState>
  locale: Locale
  contactEmail: string
  privacyHref: string
}

/**
 * Contact form: name, email, topic and message — nothing more (data minimisation). Spam
 * protection is a hidden honeypot field; no captcha, no cookies.
 */
export function ContactForm({ action, locale, contactEmail, privacyHref }: ContactFormProps) {
  const t = useTranslations('contact.form')
  const [state, formAction, isPending] = useActionState(action, INITIAL_CONTACT_STATE)
  const formRef = useRef<HTMLFormElement>(null)
  const successRef = useRef<HTMLHeadingElement>(null)
  const id = useId()

  // Move focus to what changed: the first invalid field, or the confirmation.
  useEffect(() => {
    if (state.status === 'invalid') {
      formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()
    }
    if (state.status === 'success') {
      successRef.current?.focus()
    }
  }, [state])

  if (state.status === 'success') {
    return (
      <div className="rounded-2xl bg-surface-highlight p-8 text-center">
        <CheckCircle2 aria-hidden="true" className="mx-auto size-12 text-brand-primary" />
        <h2 ref={successRef} tabIndex={-1} className="mt-3 text-2xl font-bold">
          {t('success.heading')}
        </h2>
        <p className="mt-1 text-text-muted">{t('success.text')}</p>
      </div>
    )
  }

  const values = state.status === 'invalid' || state.status === 'error' ? state.values : {}
  const errors = state.status === 'invalid' ? state.fieldErrors : {}
  const fieldId = (field: ContactField) => `${id}-${field}`
  const errorFor = (field: ContactField) => {
    const code = errors[field]
    return code ? t(`errors.${code}`) : undefined
  }

  return (
    <form ref={formRef} action={formAction} noValidate className="space-y-5">
      {state.status === 'invalid' && (
        <p
          role="alert"
          className="rounded-lg bg-status-danger-surface p-3 text-sm font-medium text-status-danger-text"
        >
          {t('errors.summary')}
        </p>
      )}
      {state.status === 'error' && (
        <p
          role="alert"
          className="rounded-lg bg-status-danger-surface p-3 text-sm font-medium text-status-danger-text"
        >
          {t('errors.server', { email: contactEmail })}
        </p>
      )}

      <input type="hidden" name="locale" value={locale} />

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField id={fieldId('name')} label={t('name')} error={errorFor('name')}>
          {(control) => (
            <input
              {...control}
              name="name"
              autoComplete="name"
              required
              maxLength={NAME_MAX_LENGTH}
              defaultValue={values.name}
              className={formControlClassName}
            />
          )}
        </FormField>
        <FormField id={fieldId('email')} label={t('email')} error={errorFor('email')}>
          {(control) => (
            <input
              {...control}
              name="email"
              type="email"
              autoComplete="email"
              required
              defaultValue={values.email}
              className={formControlClassName}
            />
          )}
        </FormField>
      </div>

      <FormField id={fieldId('topic')} label={t('topic.label')} error={errorFor('topic')}>
        {(control) => (
          <select
            {...control}
            name="topic"
            required
            defaultValue={values.topic ?? ''}
            className={formControlClassName}
          >
            <option value="" disabled>
              {t('choose')}
            </option>
            {CONTACT_TOPICS.map((topic) => (
              <option key={topic} value={topic}>
                {t(`topic.options.${topic}`)}
              </option>
            ))}
          </select>
        )}
      </FormField>

      <FormField id={fieldId('message')} label={t('message')} error={errorFor('message')}>
        {(control) => (
          <textarea
            {...control}
            name="message"
            rows={5}
            required
            maxLength={MESSAGE_MAX_LENGTH}
            defaultValue={values.message}
            className={formControlClassName}
          />
        )}
      </FormField>

      {/* Honeypot: off-screen for people and skipped by keyboard and screen readers. */}
      <div aria-hidden="true" className="absolute left-[-9999px] h-px w-px overflow-hidden">
        <label htmlFor={`${id}-${HONEYPOT_FIELD}`}>{t('honeypot')}</label>
        <input
          id={`${id}-${HONEYPOT_FIELD}`}
          name={HONEYPOT_FIELD}
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <p className="text-sm text-text-muted">
        {t.rich('privacy', {
          link: (chunks) => (
            <Link href={privacyHref} className="text-brand-primary underline underline-offset-4">
              {chunks}
            </Link>
          ),
        })}
      </p>

      <Button type="submit" size="lg" disabled={isPending} aria-busy={isPending}>
        {isPending ? t('sending') : t('submit')}
      </Button>
    </form>
  )
}
