/**
 * Sponsors from the previous WordPress site: the "Sponsors" block on its homepage, plus the title
 * sponsor announcement (February 2024) and the new sponsor announcement (June 2025). Delhi and
 * Physio Kumar have been listed since December 2023 (when their logos were uploaded).
 */
import type { SeedSponsor } from '../types'

export const SEED_SPONSORS: readonly SeedSponsor[] = [
  {
    name: 'mein-banker',
    logo: { file: 'new-title-sponsor-1.png' },
    tier: 'title',
    since: 2024,
    website: 'https://www.mein-banker.de/tonymueller',
    announcement: 'new-title-sponsor',
    description: {
      en: 'mein-banker offers personal financial advice across banking, investments and insurance. As our title sponsor, mein-banker supports the club and is on our team jersey.',
      de: 'mein-banker bietet persönliche Finanzberatung rund um Bankgeschäfte, Geldanlage und Versicherungen. Als Hauptsponsor unterstützt mein-banker den Verein und ist auf unserem Trikot zu sehen.',
    },
  },
  {
    name: 'OVB Finanzberater Denis Martin',
    logo: { file: 'ovb-logo.png' },
    tier: 'sponsor',
    since: 2025,
    website: 'https://www.ovb.de/finanzberater/nuernberg-martin-denis.html',
    announcement: 'new-sponsor-ovb-finanzberater-denis-martin',
    description: {
      en: 'Denis Martin, financial advisor with OVB in Nuremberg, offers personal financial planning: an analysis of your goals, a tailored strategy and ongoing support.',
      de: 'Denis Martin, Finanzberater bei OVB in Nürnberg, bietet persönliche Finanzplanung: eine Analyse deiner Ziele, eine passende Strategie und laufende Begleitung.',
    },
  },
  {
    name: 'Delhi Erlangen',
    logo: {
      file: 'delhi-erlangen-logo.jpg',
      alt: 'Delhi, Indisches Spezialitäten-Restaurant logo',
    },
    tier: 'sponsor',
    since: 2023,
    website: 'https://delhierlangen.de/',
    description: {
      en: 'Delhi Erlangen serves traditional Indian food in Erlangen.',
      de: 'Das Delhi Erlangen serviert traditionelle indische Küche in Erlangen.',
    },
  },
  {
    name: 'Physio Kumar',
    logo: { file: 'physio-kumar-logo.png', alt: 'Physio Kumar logo' },
    tier: 'sponsor',
    since: 2023,
    website: 'https://physio-kumar.de/',
    description: {
      en: 'Physiotherapy in Erlangen by Udhay Kumar, the club’s physio.',
      de: 'Physiotherapie in Erlangen von Udhay Kumar, dem Physiotherapeuten unseres Vereins.',
    },
  },
]
