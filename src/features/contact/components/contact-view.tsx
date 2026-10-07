import { ExternalLink, Mail, MapPin, Navigation, Send } from 'lucide-react'
import { useTranslations } from 'next-intl'

import type { Locale } from '@/i18n/routing'
import { Button } from '@/shared/ui/button'

import { buildDirectionsUrl } from '../domain/map'
import { GROUND_SECTION_ID } from '../paths'
import type { ContactInfo, Ground } from '../types'
import { ContactForm, type ContactFormProps } from './contact-form'
import { GroundMap } from './ground-map'

export type ContactViewProps = {
  info: ContactInfo
  locale: Locale
  messageAction: ContactFormProps['action']
  privacyHref: string
}

const linkClassName =
  'inline-flex min-h-11 items-center gap-1.5 font-medium text-brand-primary underline-offset-4 hover:underline'

function SocialLink({ href, label }: { href: string; label: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={linkClassName}>
      {label}
      <ExternalLink aria-hidden="true" className="size-4" />
    </a>
  )
}

function GroundSection({ ground }: { ground: Ground }) {
  const t = useTranslations('contact.ground')

  return (
    <section
      id={GROUND_SECTION_ID}
      aria-labelledby={`${GROUND_SECTION_ID}-heading`}
      className="scroll-mt-24 rounded-3xl border border-border-default bg-surface-default p-6 shadow-sm sm:p-10"
    >
      <h2
        id={`${GROUND_SECTION_ID}-heading`}
        className="flex items-center gap-2 text-2xl font-bold"
      >
        <MapPin aria-hidden="true" className="size-6 text-brand-primary" />
        {t('heading')}
      </h2>
      <div className="mt-6 grid gap-8 lg:grid-cols-content-aside">
        <GroundMap coordinates={ground.coordinates} placeName={ground.name} />
        <div className="space-y-5">
          <address className="text-lg not-italic">
            <span className="block font-semibold">{ground.name}</span>
            {ground.street}, {ground.postalCode} {ground.city}
          </address>
          <Button asChild variant="secondary">
            <a
              href={buildDirectionsUrl(ground.coordinates)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Navigation aria-hidden="true" />
              {t('openMap')}
            </a>
          </Button>
          {ground.directions && (
            <div>
              <h3 className="font-semibold">{t('directions')}</h3>
              <p className="mt-1 text-text-muted">{ground.directions}</p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

/** The contact page: a message form, email and social media, and the ground with a map. */
export function ContactView({ info, locale, messageAction, privacyHref }: ContactViewProps) {
  const t = useTranslations('contact')

  return (
    <div className="space-y-8">
      <header className="max-w-3xl space-y-3">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">{t('title')}</h1>
        <p className="text-lg text-text-muted">{t('lead')}</p>
      </header>

      <div className="grid items-start gap-8 lg:grid-cols-content-aside">
        <section
          aria-labelledby="message-heading"
          className="rounded-3xl border border-border-default bg-surface-default p-6 shadow-sm sm:p-10"
        >
          <h2 id="message-heading" className="flex items-center gap-2 text-2xl font-bold">
            <Send aria-hidden="true" className="size-6 text-brand-primary" />
            {t('form.heading')}
          </h2>
          <p className="mt-1 mb-6 text-text-muted">{t('form.intro')}</p>
          <ContactForm
            action={messageAction}
            locale={locale}
            contactEmail={info.email}
            privacyHref={privacyHref}
          />
        </section>

        <section
          aria-labelledby="channels-heading"
          className="rounded-3xl bg-surface-highlight p-6 sm:p-10"
        >
          <h2 id="channels-heading" className="flex items-center gap-2 text-2xl font-bold">
            <Mail aria-hidden="true" className="size-6 text-brand-primary" />
            {t('email.heading')}
          </h2>
          <p className="mt-1 text-text-muted">{t('email.intro')}</p>
          <a href={`mailto:${info.email}`} className={`${linkClassName} mt-4 text-lg break-all`}>
            {info.email}
          </a>
          {(info.facebookUrl ?? info.instagramUrl) && (
            <ul className="mt-2 flex flex-wrap gap-x-6">
              {info.facebookUrl && (
                <li>
                  <SocialLink href={info.facebookUrl} label="Facebook" />
                </li>
              )}
              {info.instagramUrl && (
                <li>
                  <SocialLink href={info.instagramUrl} label="Instagram" />
                </li>
              )}
            </ul>
          )}
        </section>
      </div>

      {info.ground && <GroundSection ground={info.ground} />}
    </div>
  )
}
