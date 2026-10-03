import { getTranslations } from 'next-intl/server'

import { Link } from '@/i18n/navigation'
import { Button } from '@/shared/ui/button'

export async function generateMetadata() {
  const t = await getTranslations('notFound')

  return { title: t('title'), robots: { index: false } }
}

export default async function NotFoundPage() {
  const t = await getTranslations('notFound')

  return (
    <section className="mx-auto flex max-w-3xl flex-col items-start gap-4 px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight">{t('heading')}</h1>
      <p className="text-text-muted">{t('description')}</p>
      <Button asChild>
        <Link href="/">{t('backHome')}</Link>
      </Button>
    </section>
  )
}
