import type { ComponentProps } from 'react'

import { cn } from '@/shared/lib/cn'

/** Placeholder block for loading states. Decorative: announce loading separately (e.g. role="status"). */
export function Skeleton({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      aria-hidden="true"
      className={cn('animate-pulse rounded-md bg-surface-muted', className)}
      {...props}
    />
  )
}
