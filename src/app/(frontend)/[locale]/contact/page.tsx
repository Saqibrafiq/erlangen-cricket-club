import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

import {
  CONTACT_PATH,
  ContactView,
  getContactInfo,
  submitContactMessageAction,
} from '@/features/contact'
import { LEGAL_PATHS } from '@/features/legal'
import { resolveLocale } from '@/i18n/locale'
import { buildAlternates } from '@/shared/lib/seo'
import { Container } from '@/shared/ui/container'

export async function generateMetadata({
  params,
}: PageProps<'/[locale]/contact'>): Promise<Metadata> {
  const locale = await resolveLocale(params)
  const t = await getTranslations({ locale, namespace: 'contact' })

  return {
    title: t('title'),
    description: t('metaDescription'),
    alternates: buildAlternates(CONTACT_PATH, locale),
    openGraph: { title: t('title'), description: t('metaDescription') },
  }
}

export default async function ContactPage({ params }: PageProps<'/[locale]/contact'>) {
  const locale = await resolveLocale(params)
  const info = await getContactInfo(locale)

  return (
    <Container className="py-10">
      <ContactView
        info={info}
        locale={locale}
        messageAction={submitContactMessageAction}
        privacyHref={LEGAL_PATHS.privacy}
      />
    </Container>
  )
}
