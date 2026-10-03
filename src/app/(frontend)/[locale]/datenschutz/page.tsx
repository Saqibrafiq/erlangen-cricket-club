import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

import { getLegalContent, LEGAL_PATHS, LegalContent } from '@/features/legal'
import { resolveLocale } from '@/i18n/locale'
import { buildAlternates } from '@/shared/lib/seo'
import { Container } from '@/shared/ui/container'

export async function generateMetadata({
  params,
}: PageProps<'/[locale]/datenschutz'>): Promise<Metadata> {
  const locale = await resolveLocale(params)
  const t = await getTranslations({ locale, namespace: 'legal' })

  return {
    title: t('privacyTitle'),
    alternates: buildAlternates(LEGAL_PATHS.privacy, locale),
  }
}

export default async function PrivacyPolicyPage({ params }: PageProps<'/[locale]/datenschutz'>) {
  const locale = await resolveLocale(params)
  const [t, content] = await Promise.all([
    getTranslations({ locale, namespace: 'legal' }),
    getLegalContent('privacy', locale),
  ])

  return (
    <Container width="prose" className="space-y-8 py-10">
      <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">
        {t('privacyTitle')}
      </h1>
      <LegalContent content={content} />
    </Container>
  )
}
