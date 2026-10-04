import { useTranslations } from 'next-intl'

import { Link } from '@/i18n/navigation'
import { siteConfig } from '@/shared/config/site'

import { NavLink } from './nav-link'
import { NavMenu, type NavigationGroup, type NavigationLink } from './nav-menu'
import { Container } from './container'
import { LocaleSwitcher } from './locale-switcher'

export type SiteNavigationItem = NavigationLink & {
  /** When present, the item opens a dropdown with these groups instead of linking directly. */
  groups?: readonly NavigationGroup[]
}

export type SiteHeaderProps = {
  items: readonly SiteNavigationItem[]
}

export function SiteHeader({ items }: SiteHeaderProps) {
  const t = useTranslations('navigation')

  return (
    // Sticky from md up, translucent and blurred. On phones it wraps to two rows, so it scrolls
    // away instead of permanently covering ~15% of the screen.
    <header className="z-30 border-b border-border-default bg-surface-default/85 backdrop-blur-md md:sticky md:top-0">
      <Container className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1 py-2">
        <Link
          href="/"
          className="order-1 inline-flex min-h-11 items-center rounded-md font-display text-xl font-bold tracking-tight uppercase"
        >
          {siteConfig.name}
        </Link>
        {/* Phones: logo and languages share the first row, the nav gets a full-width second row,
            so an open dropdown never covers the language links. From md up: one row. */}
        <div className="order-2 md:order-3">
          <LocaleSwitcher />
        </div>
        <nav
          aria-label={t('label')}
          className="relative order-3 basis-full md:order-2 md:ml-auto md:basis-auto"
        >
          <ul className="flex flex-wrap gap-1">
            {items.map((item) => (
              <li key={item.href}>
                {item.groups ? (
                  <NavMenu label={item.label} href={item.href} groups={item.groups} />
                ) : (
                  <NavLink href={item.href}>{item.label}</NavLink>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </Container>
    </header>
  )
}
