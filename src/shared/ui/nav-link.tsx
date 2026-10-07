'use client'

import type { ComponentProps } from 'react'

import { Link, usePathname } from '@/i18n/navigation'
import { cn } from '@/shared/lib/cn'

export type NavLinkProps = Omit<ComponentProps<typeof Link>, 'href'> & {
  href: string
  /** Also mark the link on pages below it (e.g. "/news" on "/news/some-article"). */
  section?: boolean
}

const HOME_PATH = '/'

/**
 * Navigation link that marks the current page with aria-current="page", or — with `section` —
 * the current section with aria-current="true" on the pages below it.
 */
export function NavLink({ href, section = false, className, ...props }: NavLinkProps) {
  const pathname = usePathname()
  const isPage = pathname === href
  const isInSection = section && href !== HOME_PATH && pathname.startsWith(`${href}/`)
  const isCurrent = isPage || isInSection

  return (
    <Link
      href={href}
      aria-current={isPage ? 'page' : isInSection ? 'true' : undefined}
      className={cn(
        'inline-flex min-h-11 items-center rounded-md px-3 text-sm font-medium text-text-muted transition-colors duration-150 hover:bg-surface-muted hover:text-text-default',
        isCurrent &&
          'text-text-default underline decoration-brand-primary decoration-2 underline-offset-8',
        className,
      )}
      {...props}
    />
  )
}
