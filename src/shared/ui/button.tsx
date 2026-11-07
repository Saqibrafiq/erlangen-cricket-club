import { cva, type VariantProps } from 'class-variance-authority'
import { Slot } from 'radix-ui'

import { cn } from '@/shared/lib/cn'

import { PressableButton, type PressableButtonProps } from './pressable-button'

export const buttonVariants = cva(
  'inline-flex shrink-0 items-center justify-center gap-2 rounded-md font-medium whitespace-nowrap transition-colors duration-150 disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        primary: 'bg-brand-primary text-brand-on-primary hover:bg-brand-primary-hover',
        secondary:
          'border border-border-default bg-surface-default text-text-default hover:bg-surface-muted',
        ghost: 'text-text-default hover:bg-surface-muted',
        /** Destructive actions such as deleting; the colours swap in dark mode, keeping contrast. */
        danger: 'bg-status-danger-text text-status-danger-surface hover:bg-status-danger-text/90',
        /** On photos and dark bands (--color-media-overlay). */
        'on-media': 'bg-text-on-media text-media-overlay hover:bg-text-on-media/90',
        'on-media-outline':
          'border border-text-on-media/70 text-text-on-media hover:bg-text-on-media/10',
      },
      size: {
        sm: 'min-h-9 px-3 text-sm',
        md: 'min-h-11 px-4 text-base',
        lg: 'min-h-12 px-6 text-lg',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
)

export type ButtonProps = PressableButtonProps &
  VariantProps<typeof buttonVariants> & {
    /** Render the single child (e.g. a link) with button styling instead of a `<button>`. */
    asChild?: boolean
  }

/**
 * Links styled as buttons (`asChild`) press the same way with a short CSS transition: Radix's Slot
 * stays here, in a server-compatible component, to merge onto its one server-rendered child.
 */
const SLOT_PRESS =
  'transition-[color,background-color,border-color,transform] active:scale-97 motion-reduce:active:scale-100'

export function Button({ className, variant, size, asChild = false, ...props }: ButtonProps) {
  if (asChild) {
    return (
      <Slot.Root
        className={cn(buttonVariants({ variant, size }), SLOT_PRESS, className)}
        {...props}
      />
    )
  }
  return <PressableButton className={cn(buttonVariants({ variant, size }), className)} {...props} />
}
