import type { ReactNode } from 'react'

import { Link } from '@/i18n/navigation'
import { cn } from '@/shared/lib/cn'

export type HomeSectionProps = {
  id: string
  heading: string
  /** One line under the heading, e.g. the Instagram handle. */
  description?: string
  /** "See all" link: a page of the site, or (isExternal) another site in a new tab. */
  more?: { label: string; href: string; isExternal?: boolean }
  /** Centred heading and content, e.g. for a row of logos. */
  align?: 'start' | 'center'
  className?: string
  children: ReactNode
}

const MORE_LINK_CLASS =
  'inline-flex min-h-11 items-center font-semibold text-brand-primary underline decoration-brand-primary/30 decoration-2 underline-offset-4 transition-colors duration-150 hover:decoration-brand-primary'

/** A home page section: heading with an optional "see all" link, then its content. */
export function HomeSection({
  id,
  heading,
  description,
  more,
  align = 'start',
  className,
  children,
}: HomeSectionProps) {
  const isCentered = align === 'center'

  return (
    <section aria-labelledby={id} className={cn('space-y-6', className)}>
      <div
        className={cn(
          'flex flex-wrap gap-x-6 gap-y-2',
          isCentered ? 'flex-col items-center text-center' : 'items-end justify-between',
        )}
      >
        <div className="space-y-1">
          <h2
            id={id}
            className="font-display text-3xl font-bold tracking-tight uppercase sm:text-4xl"
          >
            {heading}
          </h2>
          {description && <p className="text-text-muted">{description}</p>}
        </div>
        {more &&
          (more.isExternal ? (
            <a
              href={more.href}
              target="_blank"
              rel="noopener noreferrer"
              className={MORE_LINK_CLASS}
            >
              {more.label}
            </a>
          ) : (
            <Link href={more.href} className={MORE_LINK_CLASS}>
              {more.label}
            </Link>
          ))}
      </div>
      {children}
    </section>
  )
}
