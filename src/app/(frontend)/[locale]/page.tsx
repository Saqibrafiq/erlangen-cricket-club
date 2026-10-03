import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

import { resolveLocale } from '@/i18n/locale'
import { siteConfig } from '@/shared/config/site'
import { buildAlternates } from '@/shared/lib/seo'
import { Container } from '@/shared/ui/container'

const HOME_PATH = '/'

export async function generateMetadata({ params }: PageProps<'/[locale]'>): Promise<Metadata> {
  const locale = await resolveLocale(params)
  const t = await getTranslations({ locale, namespace: 'metadata' })

  return {
    title: { absolute: siteConfig.name },
    description: t('siteDescription'),
    alternates: buildAlternates(HOME_PATH, locale),
    openGraph: { title: siteConfig.name, description: t('siteDescription') },
  }
}

export default async function HomePage({ params }: PageProps<'/[locale]'>) {
  const locale = await resolveLocale(params)
  const t = await getTranslations({ locale, namespace: 'home' })

  return (
    <Container asChild>
      <section className="flex flex-col gap-4 py-16 sm:py-24">
        <h1 className="text-4xl font-bold tracking-tight text-balance sm:text-5xl">
          {t('heading')}
        </h1>
        <p className="max-w-2xl text-lg text-pretty text-text-muted">{t('intro')}</p>
      </section>
    </Container>
  )
}
