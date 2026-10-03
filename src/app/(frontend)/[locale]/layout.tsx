import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { NextIntlClientProvider } from 'next-intl'
import { getTranslations } from 'next-intl/server'

import { resolveLocale } from '@/i18n/locale'
import { routing } from '@/i18n/routing'
import { siteConfig } from '@/shared/config/site'
import { buildSportsOrganizationJsonLd, TITLE_TEMPLATE } from '@/shared/lib/seo'
import { JsonLd } from '@/shared/ui/json-ld'
import { MAIN_CONTENT_ID, SkipLink } from '@/shared/ui/skip-link'

import '../globals.css'

// next/font self-hosts the font files at build time — no request to Google at runtime (GDPR).
const inter = Inter({ subsets: ['latin'], display: 'swap', variable: '--font-inter' })

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
  const t = await getTranslations({ locale, namespace: 'common' })

  return (
    <html lang={locale} className={inter.variable}>
      <body>
        <SkipLink>{t('skipToContent')}</SkipLink>
        <NextIntlClientProvider>
          <main id={MAIN_CONTENT_ID} tabIndex={-1} className="focus:outline-none">
            {children}
          </main>
        </NextIntlClientProvider>
        <JsonLd data={buildSportsOrganizationJsonLd()} />
      </body>
    </html>
  )
}
