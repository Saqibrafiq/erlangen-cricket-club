'use client'

import type { ComponentProps } from 'react'

import { Link, usePathname } from '@/i18n/navigation'
import { cn } from '@/shared/lib/cn'

export type NavLinkProps = Omit<ComponentProps<typeof Link>, 'href'> & {
  href: string
}

/** Navigation link that marks the current page with aria-current. */
export function NavLink({ href, className, ...props }: NavLinkProps) {
  const pathname = usePathname()
  const isCurrent = pathname === href

  return (
    <Link
      href={href}
      aria-current={isCurrent ? 'page' : undefined}
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
