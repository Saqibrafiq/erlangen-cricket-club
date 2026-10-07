/**
 * Membership and contact details. Fees follow the club's application form (as of February 2021),
 * confirmed by the board; training and match times as given by the board (2026); contact details
 * and directions from the previous WordPress site.
 */
import type { SeedContact, SeedMembership } from '../types'

export const SEED_MEMBERSHIP: SeedMembership = {
  heroImage: 'unveiling-erlangen-cricket-clubs-new-jersey-1.jpg',
  applicationForm: {
    file: 'ecc-membership-application-form.pdf',
    title: { en: 'Application form (PDF)', de: 'Aufnahmeantrag (PDF)' },
  },
  fees: [
    {
      name: { en: 'Indoor', de: 'Indoor' },
      includes: { en: 'Indoor cricket in winter', de: 'Indoor-Cricket im Winter' },
      annualFee: 50,
    },
    {
      name: { en: 'Passive', de: 'Passiv' },
      includes: {
        en: 'Indoor cricket\nOutdoor friendlies\nTraining sessions',
        de: 'Indoor-Cricket\nFreundschaftsspiele im Freien\nTraining',
      },
      annualFee: 100,
      reducedFee: 85,
    },
    {
      name: { en: 'Active', de: 'Aktiv' },
      includes: {
        en: 'Everything in Passive\nLeague and tournament matches',
        de: 'Alles aus Passiv\nLiga- und Turnierspiele',
      },
      annualFee: 100,
      reducedFee: 85,
      perMatchFee: 10,
      isHighlighted: true,
    },
  ],
  feesNote: {
    en: 'Tournament match: any match in a tournament organised by the BCV, the DCB or another sports organisation. Reductions for families, people in need, people with disabilities, asylum seekers, seniors and other cases of hardship are possible after talking to the board.',
    de: 'Turnierspiel: jedes Spiel in einem Turnier, das vom BCV, vom DCB oder einer anderen Sportorganisation ausgerichtet wird. Ermäßigungen für Familien, Bedürftige, Menschen mit Behinderung, Asylsuchende, Senioren und in anderen Härtefällen sind nach Rücksprache mit dem Vorstand möglich.',
  },
  terms: {
    en: 'Fees are due once a year. Either side can cancel the membership in writing with three months’ notice to the end of a month. Cancellations must arrive before 1 January; otherwise the fee for the whole coming season is due. When leaving, fees are payable until the end of the year.',
    de: 'Der Beitrag ist jährlich fällig. Die Mitgliedschaft ist von beiden Seiten mit einer Frist von drei Monaten zum Monatsende schriftlich kündbar. Kündigungen müssen vor dem 1. Januar eingehen; sonst ist der Beitrag für die gesamte kommende Saison zu zahlen. Bei einem Austritt sind die Beiträge bis zum Jahresende zu zahlen.',
  },
  sessions: [
    {
      title: { en: 'Training', de: 'Training' },
      days: ['thursday'],
      startTime: '17:30',
      endTime: '20:00',
      venue: { en: 'Erlangen Cricket Ground', de: 'Erlangen Cricket Ground' },
    },
    {
      title: { en: 'Match days', de: 'Spieltage' },
      days: ['saturday', 'sunday'],
      startTime: '11:00',
      endTime: '18:00',
      venue: {
        en: 'Erlangen Cricket Ground (home matches)',
        de: 'Erlangen Cricket Ground (Heimspiele)',
      },
    },
  ],
  sessionsNote: {
    en: 'Changes and cancellations are announced on our Facebook page and in the club news.',
    de: 'Änderungen oder Ausfälle geben wir auf unserer Facebook-Seite und in den Neuigkeiten bekannt.',
  },
}

export const SEED_CONTACT: SeedContact = {
  email: 'erlangencricketclub@gmail.com',
  facebookUrl: 'https://www.facebook.com/CricketClubErlangen',
  instagramUrl: 'https://www.instagram.com/er_cricketclub',
  ground: {
    name: { en: 'Erlangen Cricket Ground', de: 'Erlangen Cricket Ground' },
    street: 'Siedlerstraße 1',
    postalCode: '91056',
    city: 'Erlangen',
    // From the old site's map link to the pitch.
    latitude: 49.593914,
    longitude: 10.977194,
    directions: {
      en: 'The ground is at the end of Siedlerstraße, next to the mini golf course, a 10–15 minute walk from Erlangen station. From the station, head to the large car park south of the station and follow the footpath south; it passes under the motorway. Or take bus 287 to Schallershofer Straße and walk down Siedlerstraße.',
      de: 'Der Platz liegt am Ende der Siedlerstraße neben der Minigolfanlage, 10–15 Gehminuten vom Erlanger Bahnhof. Vom Bahnhof Richtung Großparkplatz südlich des Bahnhofs gehen und dem Fußweg nach Süden folgen; er führt unter der Autobahn hindurch. Alternativ mit dem Bus 287 bis Schallershofer Straße fahren und die Siedlerstraße hinunterlaufen.',
    },
  },
}
