import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

import { getLegalContent, LEGAL_PATHS, LegalContent } from '@/features/legal'
import { resolveLocale } from '@/i18n/locale'
import { buildAlternates } from '@/shared/lib/seo'
import { Container } from '@/shared/ui/container'

export async function generateMetadata({
  params,
}: PageProps<'/[locale]/impressum'>): Promise<Metadata> {
  const locale = await resolveLocale(params)
  const t = await getTranslations({ locale, namespace: 'legal' })

  return {
    title: t('impressumTitle'),
    alternates: buildAlternates(LEGAL_PATHS.impressum, locale),
  }
}

export default async function ImpressumPage({ params }: PageProps<'/[locale]/impressum'>) {
  const locale = await resolveLocale(params)
  const [t, content] = await Promise.all([
    getTranslations({ locale, namespace: 'legal' }),
    getLegalContent('impressum', locale),
  ])

  return (
    <Container width="prose" className="space-y-8 py-10">
      <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">
        {t('impressumTitle')}
      </h1>
      <LegalContent content={content} />
    </Container>
  )
}
