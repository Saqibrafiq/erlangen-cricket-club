'use client'

import { Check, ChevronDown } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { DropdownMenu } from 'radix-ui'

import { Link, usePathname } from '@/i18n/navigation'
import { routing, type Locale } from '@/i18n/routing'

import { Flag, type FlagCountry } from './flag'

type Language = {
  /** Named in itself ("Deutsch", "English"), so speakers recognise it whatever the current language. */
  name: string
  flag: FlagCountry
}

const LANGUAGES: Record<Locale, Language> = {
  en: { name: 'English', flag: 'gb' },
  de: { name: 'Deutsch', flag: 'de' },
}

/** A language menu: the current language's flag and code, opening a list of the page in every language. */
export function LocaleSwitcher() {
  const t = useTranslations('navigation')
  const activeLocale = useLocale()
  const currentLocale =
    routing.locales.find((locale) => locale === activeLocale) ?? routing.defaultLocale
  const pathname = usePathname()
  const current = LANGUAGES[currentLocale]

  return (
    <DropdownMenu.Root modal={false}>
      <DropdownMenu.Trigger className="group inline-flex min-h-11 items-center gap-2 rounded-full border border-border-default px-3 text-sm font-semibold uppercase transition-colors duration-150 hover:bg-surface-muted data-[state=open]:bg-surface-muted">
        <Flag country={current.flag} />
        {currentLocale}
        <span className="sr-only">
          {t('languageLabel')}: {current.name}
        </span>
        <ChevronDown
          aria-hidden="true"
          className="size-4 text-text-muted transition-transform duration-150 group-data-[state=open]:rotate-180"
        />
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={6}
          aria-label={t('languageLabel')}
          className="z-50 min-w-44 rounded-xl border border-border-default bg-surface-default p-1.5 shadow-lg motion-safe:animate-fade-in"
        >
          {routing.locales.map((locale) => {
            const language = LANGUAGES[locale]
            const isCurrent = locale === currentLocale

            return (
              <DropdownMenu.Item key={locale} asChild>
                <Link
                  href={pathname}
                  locale={locale}
                  hrefLang={locale}
                  lang={locale}
                  aria-current={isCurrent ? 'true' : undefined}
                  className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg px-3 text-sm font-medium outline-none data-highlighted:bg-surface-muted"
                >
                  <Flag country={language.flag} />
                  <span className="flex-1">{language.name}</span>
                  {isCurrent && <Check aria-hidden="true" className="size-4 text-brand-primary" />}
                </Link>
              </DropdownMenu.Item>
            )
          })}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}
