'use client'

import { cva, type VariantProps } from 'class-variance-authority'
import { motion } from 'motion/react'
import { useId } from 'react'

import { cn } from '@/shared/lib/cn'

import { SPRING } from './motion-presets'

const pillListVariants = cva('mt-1.5 flex flex-wrap gap-2', {
  variants: {
    layout: {
      /** Pills wrap in rows. */
      wrap: '',
      /** Wrapping rows on small screens, a vertical list in a sidebar from lg. */
      sidebar: 'lg:flex-col lg:flex-nowrap lg:gap-1',
    },
  },
  defaultVariants: { layout: 'wrap' },
})

export type PillOption<V extends string> = {
  value: V
  label: string
  /** Shown in brackets after the label, e.g. the number of matching items. */
  count?: number
}

export type PillGroupProps<V extends string> = VariantProps<typeof pillListVariants> & {
  legend: string
  /** The legend is still announced when hidden, e.g. when a heading nearby says enough. */
  isLegendHidden?: boolean
  options: readonly PillOption<V>[]
  value: V
  onChange: (value: V) => void
  className?: string
}

/**
 * A single-choice filter rendered as pills: native radios (visually hidden) inside labels. The
 * selected pill's colour slides over to the new choice (one shared Motion layout element per
 * group), instead of jumping.
 */
export function PillGroup<V extends string>({
  legend,
  isLegendHidden = false,
  options,
  value,
  onChange,
  layout,
  className,
}: PillGroupProps<V>) {
  const name = useId()

  return (
    <fieldset className={className}>
      <legend className={cn('text-sm font-medium', isLegendHidden && 'sr-only')}>{legend}</legend>
      <div className={pillListVariants({ layout })}>
        {options.map((option) => {
          const isChecked = option.value === value

          return (
            <label
              key={option.value}
              className={cn(
                'relative isolate inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-full border px-4 text-sm font-medium transition-colors duration-200 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-focus-ring',
                layout === 'sidebar' && 'lg:justify-between lg:rounded-md',
                isChecked
                  ? 'border-transparent text-brand-on-primary'
                  : 'border-border-default hover:bg-surface-muted',
              )}
            >
              {isChecked && (
                <motion.span
                  aria-hidden="true"
                  layoutId={`${name}-selected`}
                  transition={SPRING}
                  className={cn(
                    'absolute -inset-px -z-10 rounded-full bg-brand-primary',
                    layout === 'sidebar' && 'lg:rounded-md',
                  )}
                />
              )}
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={isChecked}
                onChange={() => {
                  onChange(option.value)
                }}
                className="sr-only"
              />
              {option.label}
              {option.count !== undefined && (
                <>
                  {' '}
                  <span className="tabular-nums">({option.count})</span>
                </>
              )}
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}
