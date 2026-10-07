/**
 * The club's story and timeline, from the previous WordPress site: the About page (2024) and the
 * news posts each milestone links to. Claims the board corrected (player nationalities, ground
 * dimensions and standards) are left out on purpose.
 */
import type { SeedJourney } from '../types'

export const SEED_JOURNEY: SeedJourney = {
  chapters: [
    {
      title: { en: 'How it all started', de: 'Wie alles begann' },
      text: {
        en: 'Since 2011, cricket has been quietly flourishing in Erlangen, largely unnoticed by most locals. At the same time a fast-growing cricket scene took shape across Bavaria, above all in Munich with more than eleven registered teams, and the Bavarian league became known for its intense matches.',
        de: 'Seit 2011 wächst in Erlangen still und leise eine Cricket-Gemeinschaft, von den meisten Einheimischen kaum bemerkt. Gleichzeitig entstand in ganz Bayern eine schnell wachsende Cricket-Szene, vor allem in München mit mehr als elf gemeldeten Mannschaften, und die bayerische Liga wurde für ihre spannenden Spiele bekannt.',
      },
    },
    {
      title: { en: 'Our story', de: 'Unsere Geschichte' },
      text: {
        en: 'Our journey began in 2010 when the first players signed up. Erlangen Cricket Club started with one team and around 22 members and has become a focal point for cricket lovers in the region: a multinational club where people from many countries play together, on our own ground with a permanent artificial turf pitch.',
        de: 'Unsere Geschichte begann 2010, als sich die ersten Spieler anmeldeten. Der Erlangen Cricket Club startete mit einer Mannschaft und rund 22 Mitgliedern und ist heute ein Treffpunkt für Cricket-Begeisterte in der Region: ein internationaler Verein, in dem Menschen aus vielen Ländern zusammen spielen, auf unserem eigenen Platz mit festem Kunstrasen-Pitch.',
      },
    },
    {
      title: { en: 'Our approach', de: 'Wofür wir stehen' },
      text: {
        en: 'We want to be a home for cricketers of all ages and backgrounds. We stand for teamwork, discipline and sportsmanship, we nurture new talent, and we want to share our love of the game with the wider community, in local, national and international cricket.',
        de: 'Wir wollen ein Zuhause für Cricketer jeden Alters und jeder Herkunft sein. Wir stehen für Teamgeist, Disziplin und Fairness, fördern neue Talente und wollen unsere Liebe zum Spiel mit allen teilen, im lokalen, nationalen und internationalen Cricket.',
      },
    },
  ],
  milestones: [
    {
      year: 2010,
      title: { en: 'The first players sign up', de: 'Die ersten Spieler melden sich an' },
      text: {
        en: 'Our journey begins: the club starts with one team and around 22 members.',
        de: 'Unsere Geschichte beginnt: Der Verein startet mit einer Mannschaft und rund 22 Mitgliedern.',
      },
    },
    {
      year: 2012,
      title: { en: 'BCV champions', de: 'BCV-Meister' },
      text: {
        en: 'Playing as the cricket team of FSV Erlangen-Bruck, we become champions of the Bavarian Cricket Association.',
        de: 'Als Cricket-Mannschaft des FSV Erlangen-Bruck werden wir Meister des Bayerischen Cricket Verbands.',
      },
      image: {
        file: 'bcv-champions-2012.png',
        alt: 'Poster: Bavarian Cricket Association champions 2012, the cricket team of FSV Erlangen-Bruck',
      },
    },
    {
      year: 2013,
      title: { en: 'Cricket in the city centre', de: 'Cricket in der Innenstadt' },
      text: {
        en: 'At the Sterne Nacht we introduce cricket to Erlangen in the pedestrian zone.',
        de: 'Bei der Sterne Nacht stellen wir Cricket mitten in der Erlanger Fußgängerzone vor.',
      },
      image: { file: 'cricket-in-the-fussgaengerzone-sterne-nacht-2013-1.jpg' },
      link: '/news/cricket-in-the-fussgaengerzone-sterne-nacht-2013',
    },
    {
      year: 2014,
      title: { en: 'Double champions', de: 'Doppelter Titel' },
      text: {
        en: 'We win the BCV Indoor Championship and the BCV ODI Championship.',
        de: 'Wir gewinnen die BCV-Hallenmeisterschaft und die BCV-ODI-Meisterschaft.',
      },
      image: { file: 'bcv-indoor-championship-2014-1.jpg' },
      link: '/news/first-win-of-the-year-bcv-indoor-championship-2014',
    },
    {
      year: 2015,
      title: { en: 'Third title in four years', de: 'Dritter Titel in vier Jahren' },
      text: {
        en: 'BCV ODI champions for the third time in four years, and indoor champions for the second year running.',
        de: 'Zum dritten Mal in vier Jahren BCV-ODI-Meister und zum zweiten Mal in Folge Hallenmeister.',
      },
      image: { file: 'ecc-won-the-bcv-odi-championship-2015-1.jpg' },
      link: '/news/ecc-won-the-bcv-odi-championship-2015',
    },
    {
      year: 2015,
      title: { en: 'Cricket for everyone', de: 'Cricket für alle' },
      text: {
        en: 'We bring cricket to Albert Schweitzer Gymnasium, the Erlangen Sports Fest and our own tape ball tournament.',
        de: 'Wir bringen Cricket ins Albert-Schweitzer-Gymnasium, zum Erlanger Sportfest und zu unserem eigenen Tape-Ball-Turnier.',
      },
      image: { file: 'introduction-of-cricket-at-albert-schweitzer-gym-4.jpg' },
      link: '/news/tape-ball-cricket-tournament-2015',
    },
    {
      year: 2017,
      title: {
        en: 'Youth cricket and the Bundesliga title',
        de: 'Jugendcricket und Bundesliga-Titel',
      },
      text: {
        en: 'Our youth programme welcomes children from 6 to 19, and we become BCV Bundesliga champions.',
        de: 'Unser Jugendprogramm nimmt Kinder von 6 bis 19 Jahren auf, und wir werden BCV-Bundesliga-Meister.',
      },
      link: '/news/bcv-bundesliga-champions-2017',
    },
    {
      year: 2023,
      title: { en: 'Bundesliga champions again', de: 'Wieder Bundesliga-Meister' },
      text: {
        en: 'With two teams and around 39 members we win the Bavarian Bundesliga, reach the final of the T20 Pokal and win 37 of 52 matches.',
        de: 'Mit zwei Mannschaften und rund 39 Mitgliedern gewinnen wir die bayerische Bundesliga, erreichen das Finale des T20-Pokals und gewinnen 37 von 52 Spielen.',
      },
      image: { file: 'the-triumph-of-resilience-eccs-journey-in-2023-1.jpg' },
      link: '/news/the-triumph-of-resilience-eccs-journey-in-2023',
    },
    {
      year: 2024,
      title: { en: 'A new look', de: 'Ein neuer Auftritt' },
      text: {
        en: 'mein-banker becomes our title sponsor and we unveil our new orange and navy jersey.',
        de: 'mein-banker wird unser Hauptsponsor und wir präsentieren unser neues Trikot in Orange und Navy.',
      },
      image: { file: 'unveiling-erlangen-cricket-clubs-new-jersey-1.jpg' },
      link: '/news/unveiling-erlangen-cricket-clubs-new-jersey',
    },
    {
      year: 2025,
      title: { en: 'A new partner', de: 'Ein neuer Partner' },
      text: {
        en: 'Financial advisor Denis Martin (OVB) joins us as a sponsor.',
        de: 'Finanzberater Denis Martin (OVB) unterstützt uns als Sponsor.',
      },
      link: '/news/new-sponsor-ovb-finanzberater-denis-martin',
    },
    {
      year: 2026,
      title: { en: 'Two teams, four competitions', de: 'Zwei Mannschaften, vier Wettbewerbe' },
      text: {
        en: 'ECC-I plays in the DCB-Bundesliga Südost and the BCV T20 Regionalliga, ECC-II in the BCV Regionalliga and the BCV T20 1. Verbandsliga.',
        de: 'ECC-I spielt in der DCB-Bundesliga Südost und der BCV T20 Regionalliga, ECC-II in der BCV Regionalliga und der BCV T20 1. Verbandsliga.',
      },
      link: '/standings',
    },
  ],
}
