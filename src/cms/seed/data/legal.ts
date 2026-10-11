import type { SeedBlock } from '../rich-text'

type LegalText = Record<'en' | 'de', SeedBlock[]>

const CLUB = 'Erlangen Cricket Club e. V.'
const STREET = 'Damaschkestraße 69A'
const POSTCODE_CITY = '91056 Erlangen'
const PRESIDENT = 'Saqib Rafiq'
const EMAIL = 'erlangencricketclub@gmail.com'
const MAILTO = { text: EMAIL, href: `mailto:${EMAIL}` }
const REGISTER_COURT = 'Amtsgericht Erlangen'
const SUPERVISORY_AUTHORITY = {
  text: 'Bayerisches Landesamt für Datenschutzaufsicht (BayLDA)',
  href: 'https://www.lda.bayern.de',
}

/**
 * Vereinsregister number at the Amtsgericht Erlangen (e.g. "VR 200123"). § 5 DDG requires it, so
 * the Impressum is only seeded once it is set; until then the page shows its "being prepared" notice.
 */
export const CLUB_REGISTER_NUMBER: string | null = null

/** Legal notice (§ 5 DDG, § 18 Abs. 2 MStV). The 1st chair represents the club alone (Satzung § 14). */
export function buildImpressum(registerNumber: string): LegalText {
  return {
    de: [
      { heading: 'Angaben gemäß § 5 DDG' },
      { paragraph: [CLUB] },
      { paragraph: [STREET] },
      { paragraph: [POSTCODE_CITY] },
      { heading: 'Vertreten durch' },
      { paragraph: [`${PRESIDENT} (1. Vorsitzender), vertretungsberechtigt gemäß § 26 BGB`] },
      { heading: 'Kontakt' },
      { paragraph: ['E-Mail: ', MAILTO] },
      { heading: 'Registereintrag' },
      { paragraph: [`Vereinsregister des ${REGISTER_COURT}, Registernummer ${registerNumber}`] },
      { heading: 'Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV' },
      { paragraph: [`${PRESIDENT}, ${STREET}, ${POSTCODE_CITY}`] },
    ],
    en: [
      { heading: 'Information according to § 5 DDG (German Digital Services Act)' },
      { paragraph: [CLUB] },
      { paragraph: [STREET] },
      { paragraph: [POSTCODE_CITY] },
      { heading: 'Represented by' },
      {
        paragraph: [`${PRESIDENT} (President), authorised to represent the club alone (§ 26 BGB)`],
      },
      { heading: 'Contact' },
      { paragraph: ['Email: ', MAILTO] },
      { heading: 'Register entry' },
      { paragraph: [`Register of associations, ${REGISTER_COURT}, number ${registerNumber}`] },
      { heading: 'Responsible for the content according to § 18 (2) MStV' },
      { paragraph: [`${PRESIDENT}, ${STREET}, ${POSTCODE_CITY}`] },
    ],
  }
}

/**
 * Privacy policy (GDPR). Mirrors what the site actually does: no cookies or tracking for visitors,
 * hosting in Frankfurt, contact form, two-click map, Instagram images fetched by our server and
 * player profiles published with consent. Update it whenever one of these changes.
 */
export const SEED_PRIVACY_POLICY: LegalText = {
  de: [
    { heading: '1. Verantwortlicher' },
    {
      paragraph: [
        `${CLUB}, ${STREET}, ${POSTCODE_CITY}, vertreten durch den 1. Vorsitzenden ${PRESIDENT}. E-Mail: `,
        MAILTO,
      ],
    },
    {
      paragraph: [
        'Ein Datenschutzbeauftragter ist nicht benannt, da die gesetzlichen Voraussetzungen dafür nicht vorliegen.',
      ],
    },
    { heading: '2. Keine Cookies, kein Tracking' },
    {
      paragraph: [
        'Diese Website setzt für Besucher keine Cookies, verwendet keine Analyse- oder Werbedienste und bindet keine Inhalte Dritter ein, solange Sie das nicht ausdrücklich anfordern (siehe Karte). Schriften werden von unserem eigenen Server geladen. Nur Redakteure, die sich im Verwaltungsbereich anmelden, erhalten ein technisch notwendiges Anmelde-Cookie (§ 25 Abs. 2 TDDDG).',
      ],
    },
    { heading: '3. Hosting und Server-Logdateien' },
    {
      paragraph: [
        'Die Website wird bei Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, USA gehostet; die Server stehen in Frankfurt am Main. Inhalte und Bilder liegen in einer Datenbank von Neon (Region Frankfurt) und im Speicherdienst Vercel Blob. Beim Aufruf einer Seite verarbeitet der Hoster technisch notwendige Daten: IP-Adresse, Datum und Uhrzeit, aufgerufene Adresse, Referrer und Browserkennung. Diese Daten dienen der sicheren Bereitstellung der Website und werden nach kurzer Zeit gelöscht.',
      ],
    },
    {
      paragraph: [
        'Rechtsgrundlage ist unser berechtigtes Interesse an einer sicheren und stabilen Website (Art. 6 Abs. 1 lit. f DSGVO). Mit den Anbietern bestehen Verträge zur Auftragsverarbeitung (Art. 28 DSGVO). Soweit Daten in die USA übermittelt werden können, erfolgt dies auf Grundlage des EU-US Data Privacy Framework bzw. der EU-Standardvertragsklauseln.',
      ],
    },
    { heading: '4. Kontaktformular und E-Mail' },
    {
      paragraph: [
        'Wenn Sie uns über das Kontaktformular oder per E-Mail schreiben, verarbeiten wir Ihren Namen, Ihre E-Mail-Adresse und Ihre Nachricht, um Ihre Anfrage zu beantworten. Nachrichten aus dem Formular werden im Verwaltungsbereich der Website gespeichert, auf den nur der Vorstand Zugriff hat. Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO (Anfragen zur Mitgliedschaft) bzw. Art. 6 Abs. 1 lit. f DSGVO (sonstige Anfragen). Wir löschen die Nachricht, sobald die Anfrage erledigt ist, spätestens nach einem Jahr. Zum Schutz vor Spam nutzen wir ein unsichtbares Formularfeld, keine Captcha-Dienste Dritter.',
      ],
    },
    { heading: '5. Karte (OpenStreetMap)' },
    {
      paragraph: [
        'Die Karte zum Trainingsplatz wird erst geladen, wenn Sie sie anklicken. Dann lädt Ihr Browser Kartenbilder von der OpenStreetMap Foundation, St John’s Innovation Centre, Cowley Road, Cambridge, CB4 0WS, Großbritannien, die dabei Ihre IP-Adresse erhält. Rechtsgrundlage ist Ihre Einwilligung durch den Klick (Art. 6 Abs. 1 lit. a DSGVO, § 25 Abs. 1 TDDDG). Für Großbritannien besteht ein Angemessenheitsbeschluss der EU-Kommission. Weitere Informationen: ',
        {
          text: 'Datenschutzerklärung der OSM Foundation',
          href: 'https://osmfoundation.org/wiki/Privacy_Policy',
        },
      ],
    },
    { heading: '6. Instagram' },
    {
      paragraph: [
        'Auf der Startseite zeigen wir unsere neuesten Instagram-Beiträge. Die Bilder ruft unser Server über die Instagram-Schnittstelle von Meta Platforms Ireland Ltd. ab und liefert sie selbst aus; beim Besuch unserer Website wird keine Verbindung zu Meta hergestellt. Erst wenn Sie einen Beitrag oder unser Profil anklicken, gelangen Sie zu Instagram, und es gilt die Datenschutzerklärung von Meta. Dasselbe gilt für die Links zu Instagram und Facebook in der Fußzeile.',
      ],
    },
    { heading: '7. Spielerprofile' },
    {
      paragraph: [
        'Name, Foto, Rolle im Team und sportliche Angaben von Spielern veröffentlichen wir nur mit ihrer Einwilligung (Art. 6 Abs. 1 lit. a DSGVO). Die Einwilligung kann jederzeit mit Wirkung für die Zukunft per E-Mail an uns widerrufen werden; das Profil wird dann entfernt. Mannschaftsergebnisse und Tabellen sind öffentliche Spielinformationen der Verbände.',
      ],
    },
    { heading: '8. Ihre Rechte' },
    {
      paragraph: [
        'Sie haben das Recht auf Auskunft (Art. 15 DSGVO), Berichtigung (Art. 16), Löschung (Art. 17), Einschränkung der Verarbeitung (Art. 18), Datenübertragbarkeit (Art. 20) und Widerspruch gegen Verarbeitungen auf Grundlage berechtigter Interessen (Art. 21). Eine Einwilligung können Sie jederzeit widerrufen (Art. 7 Abs. 3). Schreiben Sie uns dazu formlos an ',
        MAILTO,
        '.',
      ],
    },
    {
      paragraph: [
        'Sie können sich außerdem bei einer Datenschutz-Aufsichtsbehörde beschweren. Für uns zuständig ist das ',
        SUPERVISORY_AUTHORITY,
        ', Promenade 18, 91522 Ansbach.',
      ],
    },
    { heading: '9. Verschlüsselung' },
    {
      paragraph: [
        'Die Website wird ausschließlich über HTTPS ausgeliefert, sodass übertragene Daten nicht von Dritten mitgelesen werden können.',
      ],
    },
  ],
  en: [
    { heading: '1. Controller' },
    {
      paragraph: [
        `${CLUB}, ${STREET}, ${POSTCODE_CITY}, represented by the President, ${PRESIDENT}. Email: `,
        MAILTO,
      ],
    },
    {
      paragraph: [
        'We have not appointed a data protection officer because the legal requirements for one are not met.',
      ],
    },
    { heading: '2. No cookies, no tracking' },
    {
      paragraph: [
        'This website sets no cookies for visitors, uses no analytics or advertising services and loads no third-party content unless you explicitly request it (see the map). Fonts are served from our own server. Only editors who sign in to the admin area receive a strictly necessary sign-in cookie (§ 25 (2) TDDDG).',
      ],
    },
    { heading: '3. Hosting and server log files' },
    {
      paragraph: [
        'The website is hosted by Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, USA, on servers in Frankfurt am Main. Content and images are stored in a Neon database (Frankfurt region) and in the Vercel Blob storage service. When you open a page, the host processes technically necessary data: IP address, date and time, the address requested, the referrer and the browser identification. These data are used to deliver the website securely and are deleted after a short time.',
      ],
    },
    {
      paragraph: [
        'The legal basis is our legitimate interest in a secure and stable website (Art. 6 (1) (f) GDPR). We have data processing agreements with these providers (Art. 28 GDPR). Where data may be transferred to the USA, this is based on the EU-US Data Privacy Framework or the EU standard contractual clauses.',
      ],
    },
    { heading: '4. Contact form and email' },
    {
      paragraph: [
        'When you write to us through the contact form or by email, we process your name, email address and message to answer your enquiry. Messages from the form are stored in the website’s admin area, which only the board can access. The legal basis is Art. 6 (1) (b) GDPR (membership enquiries) or Art. 6 (1) (f) GDPR (other enquiries). We delete the message once your enquiry is resolved, at the latest after one year. To keep out spam we use an invisible form field, not a third-party captcha.',
      ],
    },
    { heading: '5. Map (OpenStreetMap)' },
    {
      paragraph: [
        'The map of the ground is only loaded when you click it. Your browser then loads map images from the OpenStreetMap Foundation, St John’s Innovation Centre, Cowley Road, Cambridge, CB4 0WS, United Kingdom, which receives your IP address. The legal basis is your consent given by the click (Art. 6 (1) (a) GDPR, § 25 (1) TDDDG). The European Commission has issued an adequacy decision for the United Kingdom. More information: ',
        {
          text: 'OSM Foundation privacy policy',
          href: 'https://osmfoundation.org/wiki/Privacy_Policy',
        },
      ],
    },
    { heading: '6. Instagram' },
    {
      paragraph: [
        'The home page shows our latest Instagram posts. Our server fetches the images through the Instagram API of Meta Platforms Ireland Ltd. and serves them itself; visiting our website does not connect you to Meta. Only when you click a post or our profile are you taken to Instagram, where Meta’s privacy policy applies. The same applies to the Instagram and Facebook links in the footer.',
      ],
    },
    { heading: '7. Player profiles' },
    {
      paragraph: [
        'We publish players’ names, photos, playing roles and cricket details only with their consent (Art. 6 (1) (a) GDPR). Consent can be withdrawn at any time, with effect for the future, by emailing us; the profile is then removed. Team results and league tables are public match information of the cricket associations.',
      ],
    },
    { heading: '8. Your rights' },
    {
      paragraph: [
        'You have the right of access (Art. 15 GDPR), rectification (Art. 16), erasure (Art. 17), restriction of processing (Art. 18), data portability (Art. 20) and to object to processing based on legitimate interests (Art. 21). You can withdraw consent at any time (Art. 7 (3)). Just write to ',
        MAILTO,
        '.',
      ],
    },
    {
      paragraph: [
        'You can also lodge a complaint with a data protection supervisory authority. The authority responsible for us is the ',
        SUPERVISORY_AUTHORITY,
        ', Promenade 18, 91522 Ansbach, Germany.',
      ],
    },
    { heading: '9. Encryption' },
    {
      paragraph: [
        'The website is served over HTTPS only, so data in transit cannot be read by third parties.',
      ],
    },
  ],
}
