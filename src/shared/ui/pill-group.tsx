'use client'

import { cva, type VariantProps } from 'class-variance-authority'
import { useId } from 'react'

import { cn } from '@/shared/lib/cn'

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

/** A single-choice filter rendered as pills: native radios (visually hidden) inside labels. */
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
                'inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-full border px-4 text-sm font-medium transition-colors duration-150 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-focus-ring',
                layout === 'sidebar' && 'lg:justify-between lg:rounded-md',
                isChecked
                  ? 'border-brand-primary bg-brand-primary text-brand-on-primary'
                  : 'border-border-default hover:bg-surface-muted',
              )}
            >
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
