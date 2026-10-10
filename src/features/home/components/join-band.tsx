import { useTranslations } from 'next-intl'

import { Link } from '@/i18n/navigation'
import { Button } from '@/shared/ui/button'

export type JoinBandProps = {
  joinHref: string
}

/** The closing call to action: come and play. */
export function JoinBand({ joinHref }: JoinBandProps) {
  const t = useTranslations('home.joinBand')

  return (
    <section
      aria-labelledby="join-heading"
      className="relative isolate flex flex-col items-center gap-6 overflow-hidden rounded-3xl bg-linear-to-br from-brand-surface to-media-overlay px-6 py-16 text-center text-text-on-media sm:py-24"
    >
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-dots-on-media" />
      <h2
        id="join-heading"
        className="font-display text-5xl leading-none font-bold uppercase sm:text-7xl"
      >
        {t('heading')}
      </h2>
      <p className="max-w-xl text-lg opacity-90">{t('text')}</p>
      <Button asChild size="lg" variant="on-media">
        <Link href={joinHref}>{t('button')}</Link>
      </Button>
    </section>
  )
}
