import { cva, type VariantProps } from 'class-variance-authority'
import { Slot } from 'radix-ui'
import type { ComponentProps } from 'react'

import { cn } from '@/shared/lib/cn'

export const containerVariants = cva('mx-auto w-full px-4 sm:px-6 lg:px-8', {
  variants: {
    width: {
      /** Page layout: header, lists, grids. Full width with gutters up to 100rem, then centred. */
      wide: 'max-w-page',
      /** Long-form reading (news articles, legal pages): ~65–75 characters per line. */
      prose: 'max-w-3xl',
    },
  },
  defaultVariants: {
    width: 'wide',
  },
})

export type ContainerProps = ComponentProps<'div'> &
  VariantProps<typeof containerVariants> & {
    /** Render the single child (e.g. a `<section>`) instead of a `<div>`. */
    asChild?: boolean
  }

/** Horizontal page bounds and gutters. Use instead of ad-hoc `mx-auto max-w-*` classes. */
export function Container({ className, width, asChild = false, ...props }: ContainerProps) {
  const Component = asChild ? Slot.Root : 'div'

  return <Component className={cn(containerVariants({ width }), className)} {...props} />
}
