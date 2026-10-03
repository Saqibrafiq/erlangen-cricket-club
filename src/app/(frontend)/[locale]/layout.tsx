import type { Metadata } from 'next'
import { Barlow_Condensed, Inter } from 'next/font/google'
import { NextIntlClientProvider } from 'next-intl'
import { getTranslations } from 'next-intl/server'

import { buildFixturesMenu, FIXTURES_PATH, getCompetitionNavigation } from '@/features/fixtures'
import { LEGAL_PATHS } from '@/features/legal'
import { resolveLocale } from '@/i18n/locale'
import { routing } from '@/i18n/routing'
import { MAIN_NAVIGATION } from '@/shared/config/navigation'
import { siteConfig } from '@/shared/config/site'
import { buildSportsOrganizationJsonLd, TITLE_TEMPLATE } from '@/shared/lib/seo'
import { JsonLd } from '@/shared/ui/json-ld'
import { SiteFooter } from '@/shared/ui/site-footer'
import { SiteHeader, type SiteNavigationItem } from '@/shared/ui/site-header'
import { MAIN_CONTENT_ID, SkipLink } from '@/shared/ui/skip-link'

import '../globals.css'

// next/font self-hosts the font files at build time — no request to Google at runtime (GDPR).
const inter = Inter({ subsets: ['latin'], display: 'swap', variable: '--font-inter' })
// Condensed display face for headings and scores: sporty, and fits large numbers in narrow cards.
const barlowCondensed = Barlow_Condensed({
  subsets: ['latin'],
  weight: ['600', '700'],
  display: 'swap',
  variable: '--font-barlow-condensed',
})

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({ params }: LayoutProps<'/[locale]'>): Promise<Metadata> {
  const locale = await resolveLocale(params)
  const t = await getTranslations({ locale, namespace: 'metadata' })

  return {
    metadataBase: new URL(siteConfig.url),
    title: { default: siteConfig.name, template: TITLE_TEMPLATE },
    description: t('siteDescription'),
    applicationName: siteConfig.name,
    openGraph: {
      type: 'website',
      siteName: siteConfig.name,
      locale,
    },
    twitter: { card: 'summary_large_image' },
  }
}

export default async function LocaleLayout({ children, params }: LayoutProps<'/[locale]'>) {
  const locale = await resolveLocale(params)
  const [t, tNavigation, tFooter, competitionNavigation] = await Promise.all([
    getTranslations({ locale, namespace: 'common' }),
    getTranslations({ locale, namespace: 'navigation' }),
    getTranslations({ locale, namespace: 'footer' }),
    getCompetitionNavigation(),
  ])
  const navigationItems: SiteNavigationItem[] = MAIN_NAVIGATION.map((item) => ({
    href: item.href,
    label: tNavigation(item.labelKey),
    groups:
      item.href === FIXTURES_PATH
        ? buildFixturesMenu(competitionNavigation, tNavigation('fixturesOverview'))
        : undefined,
  }))

  return (
    <html lang={locale} className={`${inter.variable} ${barlowCondensed.variable}`}>
      <body className="flex min-h-svh flex-col">
        <SkipLink>{t('skipToContent')}</SkipLink>
        <NextIntlClientProvider>
          <SiteHeader items={navigationItems} />
          <main id={MAIN_CONTENT_ID} tabIndex={-1} className="flex-1 focus:outline-none">
            {children}
          </main>
          <SiteFooter
            year={new Date().getFullYear()}
            legalLinks={[
              { href: LEGAL_PATHS.impressum, label: tFooter('impressum') },
              { href: LEGAL_PATHS.privacy, label: tFooter('privacy') },
            ]}
          />
        </NextIntlClientProvider>
        <JsonLd data={buildSportsOrganizationJsonLd()} />
      </body>
    </html>
  )
}
