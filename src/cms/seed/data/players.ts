/**
 * Players from the 2023–24 squad on the "ECC TEAM" page of the previous WordPress site who still
 * play for the club, with names spelled as published there. The club confirmed on 9 October 2026
 * that these players agreed to appear on the website. Players who joined the website later note
 * their own consent.
 */
import type { SeedPlayer } from '../types'

export const SEED_PLAYERS: readonly SeedPlayer[] = [
  {
    name: 'Mohammad Yasub',
    isFeaturedOnHome: true,
    photo: { file: 'player-mohammad-yasub.webp', alt: 'Mohammad Yasub in the club kit' },
  },
  {
    name: 'Ullas',
    photo: { file: 'player-ullas.webp', alt: 'Ullas in the club kit' },
  },
  {
    name: 'Tarang',
    photo: { file: 'player-tarang.webp', alt: 'Tarang in the club kit' },
  },
  {
    name: 'Sunny Kumar',
    photo: { file: 'player-sunny-kumar.webp', alt: 'Sunny Kumar in the club kit' },
  },
  {
    name: 'Sagar Suri',
    photo: { file: 'player-sagar-suri.webp', alt: 'Sagar Suri in the club kit' },
  },
  {
    name: 'Saqib Rafiq',
    isFeaturedOnHome: true,
    photo: {
      file: 'player-saqib-rafiq.webp',
      alt: 'Saqib Rafiq in the club’s orange training top',
    },
    consentNote: 'Added at the player’s own request on 10 October 2026.',
  },
  {
    name: 'Parikshhit Kulkarni',
    photo: { file: 'player-parikshhit-kulkarni.webp', alt: 'Parikshhit Kulkarni in the club kit' },
  },
  {
    name: 'Jimmy Joshi',
    isFeaturedOnHome: true,
    photo: { file: 'player-jimmy-joshi.webp', alt: 'Jimmy Joshi in the club kit' },
  },
  {
    name: 'Gursher Singh',
    isFeaturedOnHome: true,
    photo: { file: 'player-gursher-singh.webp', alt: 'Gursher Singh in the club kit' },
  },
  {
    name: 'Bilal Ahmad',
    isFeaturedOnHome: true,
    photo: { file: 'player-bilal-ahmad.webp', alt: 'Bilal Ahmad in the club kit' },
  },
  {
    name: 'Arun',
    isFeaturedOnHome: true,
    photo: { file: 'player-arun.webp', alt: 'Arun in the club kit' },
  },
  {
    name: 'Akmal Sandhu',
    isFeaturedOnHome: true,
    photo: { file: 'player-akmal-sandhu.webp', alt: 'Akmal Sandhu in the club kit' },
  },
]
