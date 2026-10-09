import { useTranslations } from 'next-intl'

import { Link } from '@/i18n/navigation'
import { siteConfig } from '@/shared/config/site'

import { Container } from './container'
import { LocaleSwitcher } from './locale-switcher'
import { MobileMenu } from './mobile-menu'
import { NavLink } from './nav-link'
import { NavMenu, type SiteNavigationItem } from './nav-menu'

export type { SiteNavigationItem } from './nav-menu'

export type SiteHeaderProps = {
  items: readonly SiteNavigationItem[]
}

/**
 * One slim sticky row: logo, navigation, languages. From xl the navigation sits in the row; below
 * that it moves into the menu panel, so the header never wraps (eight items, long German labels).
 */
export function SiteHeader({ items }: SiteHeaderProps) {
  const t = useTranslations('navigation')

  return (
    <header className="sticky top-0 z-30 border-b border-border-default bg-surface-default/85 backdrop-blur-md">
      <Container className="flex items-center justify-between gap-x-6 py-2">
        <Link
          href="/"
          className="inline-flex min-h-11 items-center rounded-md font-display text-xl font-bold tracking-tight uppercase"
        >
          {siteConfig.name}
        </Link>
        <nav aria-label={t('label')} className="ml-auto hidden xl:block">
          <ul className="flex">
            {items.map((item) => (
              <li key={item.href}>
                {item.groups ? (
                  <NavMenu label={item.label} href={item.href} groups={item.groups} />
                ) : (
                  <NavLink href={item.href} section>
                    {item.label}
                  </NavLink>
                )}
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex items-center gap-1">
          <LocaleSwitcher />
          <div className="xl:hidden">
            <MobileMenu items={items} />
          </div>
        </div>
      </Container>
    </header>
  )
}
