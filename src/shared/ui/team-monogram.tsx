import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/shared/lib/cn'
import { getMonogram } from '@/shared/lib/monogram'

export const teamMonogramVariants = cva(
  'inline-flex shrink-0 items-center justify-center rounded-full font-display font-bold tracking-tight',
  {
    variants: {
      tone: {
        /** The club's own teams, in brand colour. */
        club: 'bg-brand-primary text-brand-on-primary',
        opponent: 'bg-surface-muted text-text-default ring-1 ring-border-default',
      },
      size: {
        sm: 'size-8 text-xs',
        lg: 'size-14 text-lg',
      },
    },
    defaultVariants: { tone: 'opponent', size: 'sm' },
  },
)

export type TeamMonogramProps = VariantProps<typeof teamMonogramVariants> & {
  /** League code, e.g. "NCC-I"; reduced to its initials. */
  shortName: string
  className?: string
}

/** Decorative initials badge. Hidden from assistive technology — the team name sits next to it. */
export function TeamMonogram({ shortName, tone, size, className }: TeamMonogramProps) {
  return (
    <span aria-hidden="true" className={cn(teamMonogramVariants({ tone, size }), className)}>
      {getMonogram(shortName)}
    </span>
  )
}
