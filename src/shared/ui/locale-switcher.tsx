'use client'

import { useLocale, useTranslations } from 'next-intl'

import { Link, usePathname } from '@/i18n/navigation'
import { routing, type Locale } from '@/i18n/routing'
import { cn } from '@/shared/lib/cn'

const LANGUAGE_NAMES: Record<Locale, string> = {
  en: 'English',
  de: 'Deutsch',
}

/**
 * Links to the current page in every locale. Each language is named in itself ("Deutsch",
 * "English") so speakers recognise it whatever the current language.
 */
export function LocaleSwitcher() {
  const t = useTranslations('navigation')
  const currentLocale = useLocale()
  const pathname = usePathname()

  return (
    <nav aria-label={t('languageLabel')}>
      <ul className="flex items-center gap-1">
        {routing.locales.map((locale) => {
          const isCurrent = locale === currentLocale
          return (
            <li key={locale}>
              <Link
                href={pathname}
                locale={locale}
                hrefLang={locale}
                lang={locale}
                aria-current={isCurrent ? 'true' : undefined}
                className={cn(
                  'inline-flex min-h-11 min-w-11 items-center justify-center rounded-md px-2 text-sm font-semibold uppercase transition-colors duration-150',
                  isCurrent
                    ? 'text-text-default underline decoration-brand-primary decoration-2 underline-offset-8'
                    : 'text-text-muted hover:bg-surface-muted hover:text-text-default',
                )}
              >
                {locale}
                <span className="sr-only"> {LANGUAGE_NAMES[locale]}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
