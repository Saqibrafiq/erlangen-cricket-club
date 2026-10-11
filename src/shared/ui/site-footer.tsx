import { Clock, Mail, MapPin } from 'lucide-react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import type { ReactNode } from 'react'

import { Link } from '@/i18n/navigation'
import logo from '@/shared/assets/ecc-logo.png'
import { siteConfig } from '@/shared/config/site'

import { Container } from './container'
import type { NavigationLink } from './nav-menu'
import { SocialIcon, type SocialNetwork } from './social-icon'

// Intrinsic size of the crest asset (see SiteHeader).
const LOGO_WIDTH = 150
const LOGO_HEIGHT = 192

export type SocialLink = {
  network: SocialNetwork
  href: string
}

export type FooterColumn = {
  label: string
  links: readonly NavigationLink[]
}

export type FooterVisit = {
  /** e.g. "Thursday 17:30–20:00" */
  training: string | null
  /** Ground name and address, linking to directions. */
  ground: { name: string; address: string; href: string } | null
  email: string
}

export type SiteFooterProps = {
  /** Link columns, e.g. Club, Matches, Join. */
  columns?: readonly FooterColumn[]
  /** Where and when to find the club. */
  visit?: FooterVisit
  /** Legal links (Impressum, Datenschutz) — mandatory on German websites. */
  legalLinks: readonly NavigationLink[]
  /** The club on social media, shown as icons. */
  socialLinks?: readonly SocialLink[]
  /** Year shown in the copyright lines; passed in so rendering stays deterministic. */
  year: number
}

const LINK_CLASS =
  'inline-flex min-h-11 items-center rounded-sm opacity-80 underline-offset-4 transition-opacity duration-150 hover:opacity-100 hover:underline sm:min-h-9'

function FooterLinks({ label, links }: FooterColumn) {
  const id = `footer-${label.toLowerCase().replace(/\W+/g, '-')}`

  return (
    <nav aria-labelledby={id}>
      <h2 id={id} className="font-display text-lg font-bold uppercase">
        {label}
      </h2>
      <ul className="mt-3">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className={LINK_CLASS}>
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}

function VisitItem({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="mt-0.5 shrink-0 opacity-70">{icon}</span>
      <span className="min-w-0">{children}</span>
    </li>
  )
}

/**
 * The site footer: the club with its socials, link columns, where to find us, then a bottom bar
 * with the club's copyright, the legal pages (required in Germany) and the website's credit.
 */
export function SiteFooter({
  columns = [],
  visit,
  legalLinks,
  socialLinks = [],
  year,
}: SiteFooterProps) {
  const t = useTranslations('footer')

  return (
    <footer className="bg-media-overlay text-text-on-media">
      <Container className="grid grid-cols-3 gap-x-4 gap-y-10 py-14 sm:gap-x-6 lg:grid-cols-footer lg:gap-8">
        <div className="col-span-3 space-y-5 lg:col-span-1">
          <Link href="/" className="inline-flex items-center gap-3 rounded-md">
            <Image
              src={logo}
              alt=""
              width={LOGO_WIDTH}
              height={LOGO_HEIGHT}
              className="h-14 w-auto"
            />
            <span className="font-display text-2xl leading-none font-bold uppercase">
              {siteConfig.name}
            </span>
          </Link>
          <p className="max-w-xs opacity-80">{t('tagline')}</p>
          {socialLinks.length > 0 && (
            <ul aria-label={t('socialLabel')} className="flex gap-2">
              {socialLinks.map(({ network, href }) => (
                <li key={network}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={t(`social.${network}`, { club: siteConfig.name })}
                    className="inline-flex size-11 items-center justify-center rounded-full bg-text-on-media/10 ring-1 ring-text-on-media/15 transition-colors duration-150 hover:bg-text-on-media hover:text-media-overlay"
                  >
                    <SocialIcon network={network} />
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>

        {columns.map((column) => (
          <FooterLinks key={column.label} {...column} />
        ))}

        {visit && (
          <section aria-labelledby="footer-visit" className="col-span-3 lg:col-span-1">
            <h2 id="footer-visit" className="font-display text-lg font-bold uppercase">
              {t('visit.heading')}
            </h2>
            <ul className="mt-4 space-y-3">
              {visit.training && (
                <VisitItem icon={<Clock aria-hidden="true" className="size-4" />}>
                  <span className="block text-sm opacity-70">{t('visit.training')}</span>
                  {visit.training}
                </VisitItem>
              )}
              {visit.ground && (
                <VisitItem icon={<MapPin aria-hidden="true" className="size-4" />}>
                  <Link href={visit.ground.href} className="underline-offset-4 hover:underline">
                    <span className="block">{visit.ground.name}</span>
                    <span className="block text-sm opacity-70">{visit.ground.address}</span>
                  </Link>
                </VisitItem>
              )}
              <VisitItem icon={<Mail aria-hidden="true" className="size-4" />}>
                <a href={`mailto:${visit.email}`} className="underline-offset-4 hover:underline">
                  {/* Breaks only after the @ when the column is narrow, never inside a word. */}
                  {visit.email.replace(/@.*/, '')}@<wbr />
                  {visit.email.replace(/^[^@]*@/, '')}
                </a>
              </VisitItem>
            </ul>
          </section>
        )}
      </Container>

      <div className="border-t border-text-on-media/15">
        <Container className="flex flex-col gap-4 py-6 text-sm lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-1">
            <p>{t('copyright', { year, club: siteConfig.name })}</p>
            <p className="opacity-70">{t('clubContent')}</p>
            <nav aria-label={t('legalLabel')}>
              <ul className="flex flex-wrap gap-x-5">
                {legalLinks.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className={LINK_CLASS}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
          <div className="space-y-1 lg:text-right">
            <p>{t('credit', { name: siteConfig.author.name })}</p>
            <p className="opacity-70">
              {t('codeCopyright', { year, author: siteConfig.author.name })}
            </p>
          </div>
        </Container>
      </div>
    </footer>
  )
}
