import { useTranslations } from 'next-intl'

import { Link } from '@/i18n/navigation'
import { siteConfig } from '@/shared/config/site'

import { Container } from './container'
import type { NavigationLink } from './nav-menu'

export type SiteFooterProps = {
  /** Legal links (Impressum, Datenschutz) — mandatory on German websites. */
  legalLinks: readonly NavigationLink[]
  /** Year shown in the copyright line; passed in so rendering stays deterministic. */
  year: number
}

export function SiteFooter({ legalLinks, year }: SiteFooterProps) {
  const t = useTranslations('footer')

  return (
    <footer className="mt-16 border-t border-border-default bg-surface-muted">
      <Container className="flex flex-col gap-4 py-8 text-sm text-text-muted sm:flex-row sm:items-center sm:justify-between">
        <p>{t('copyright', { year, club: siteConfig.name })}</p>
        <nav aria-label={t('legalLabel')}>
          <ul className="flex flex-wrap gap-x-2">
            {legalLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="inline-flex min-h-11 items-center rounded-md px-2 underline-offset-4 hover:text-text-default hover:underline"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </Container>
    </footer>
  )
}
