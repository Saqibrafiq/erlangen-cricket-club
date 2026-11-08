'use client'

import { motion } from 'motion/react'
import { useTranslations } from 'next-intl'
import type { ReactNode } from 'react'

import { Link } from '@/i18n/navigation'
import { cn } from '@/shared/lib/cn'

import { Button } from './button'
import { DROPDOWN_ITEM_VARIANTS } from './motion-presets'

export type AlertProps = {
  children: ReactNode
  className?: string
}

/**
 * An error the user has to act on, announced by screen readers (`role="alert"`). It eases in on
 * the site's spring, so it is noticed without jumping into place.
 */
export function Alert({ children, className }: AlertProps) {
  return (
    <motion.div
      role="alert"
      initial="closed"
      animate="open"
      variants={DROPDOWN_ITEM_VARIANTS}
      className={cn(
        'rounded-lg bg-status-danger-surface p-3 text-sm font-medium text-status-danger-text',
        className,
      )}
    >
      {children}
    </motion.div>
  )
}

export type SignInRequiredAlertProps = {
  /** The sign-in page, returning to the current one afterwards. */
  signInHref: string
}

/** The session has ended: says so and links to signing in again (the same words everywhere). */
export function SignInRequiredAlert({ signInHref }: SignInRequiredAlertProps) {
  const t = useTranslations('alerts')
  return (
    <Alert>
      {t('sessionEnded')}{' '}
      <Link href={signInHref} className="underline underline-offset-4">
        {t('signIn')}
      </Link>
    </Alert>
  )
}

export type RetryAlertProps = {
  /** What could not be loaded, e.g. "The player could not be loaded. Please try again." */
  message: string
  onRetry: () => void
}

/** Loading failed: says so and offers to try again. */
export function RetryAlert({ message, onRetry }: RetryAlertProps) {
  const t = useTranslations('alerts')
  return (
    <Alert className="space-y-3">
      <p>{message}</p>
      <Button variant="secondary" onClick={onRetry}>
        {t('retry')}
      </Button>
    </Alert>
  )
}
