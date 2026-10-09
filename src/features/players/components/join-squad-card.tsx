import { Plus } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Link } from '@/i18n/navigation'

export type JoinSquadCardProps = {
  /** Where prospective players learn how to join, e.g. the membership page. */
  href: string
}

/** The open spot at the end of the squad: same shape as a player card, inviting visitors to join. */
export function JoinSquadCard({ href }: JoinSquadCardProps) {
  const t = useTranslations('players.join')

  return (
    <article className="group relative flex aspect-3/4 flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border-default p-3 text-center transition-colors duration-200 hover:border-brand-primary hover:bg-surface-highlight has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-focus-ring sm:gap-3 sm:rounded-3xl">
      <span className="flex size-10 items-center justify-center rounded-full bg-brand-primary text-brand-on-primary motion-safe:transition-transform motion-safe:duration-200 motion-safe:group-hover:rotate-90 sm:size-12">
        <Plus aria-hidden="true" className="size-5 sm:size-6" />
      </span>
      <h3 className="font-display text-base leading-none font-bold tracking-tight uppercase sm:text-lg">
        <Link href={href} className="after:absolute after:inset-0 focus-visible:outline-none">
          {t('heading')}
        </Link>
      </h3>
      {/* Phones: the card is too narrow for the sentence; the heading says enough. */}
      <p className="hidden text-xs text-text-muted sm:block">{t('text')}</p>
    </article>
  )
}
