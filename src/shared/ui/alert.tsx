'use client'

import { motion } from 'motion/react'
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
  /** Why the action stopped, e.g. "Your session has ended." */
  message: string
  signInLabel: string
  /** The sign-in page, returning to the current one afterwards. */
  signInHref: string
}

/** The session has ended: says so and links to signing in again. */
export function SignInRequiredAlert({
  message,
  signInLabel,
  signInHref,
}: SignInRequiredAlertProps) {
  return (
    <Alert>
      {message}{' '}
      <Link href={signInHref} className="underline underline-offset-4">
        {signInLabel}
      </Link>
    </Alert>
  )
}

export type RetryAlertProps = {
  /** What could not be loaded or done. */
  message: string
  retryLabel: string
  onRetry: () => void
}

/** Loading failed: says so and offers to try again. */
export function RetryAlert({ message, retryLabel, onRetry }: RetryAlertProps) {
  return (
    <Alert className="space-y-3">
      <p>{message}</p>
      <Button variant="secondary" onClick={onRetry}>
        {retryLabel}
      </Button>
    </Alert>
  )
}
