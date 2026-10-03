import { cva, type VariantProps } from 'class-variance-authority'
import type { ComponentProps } from 'react'

import { cn } from '@/shared/lib/cn'

export const badgeVariants = cva(
  'inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap',
  {
    variants: {
      variant: {
        neutral: 'bg-surface-muted text-text-default',
        brand: 'bg-brand-primary text-brand-on-primary',
        success: 'bg-status-success-surface text-status-success-text',
        danger: 'bg-status-danger-surface text-status-danger-text',
      },
    },
    defaultVariants: {
      variant: 'neutral',
    },
  },
)

export type BadgeProps = ComponentProps<'span'> & VariantProps<typeof badgeVariants>

/** Short status label. Always carries text — colour alone never conveys meaning (WCAG 1.4.1). */
export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}
