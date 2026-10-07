export type JourneyImage = {
  url: string
  alt: string
  width: number
  height: number
}

export type Chapter = {
  title: string
  text: string
}

export type Milestone = {
  year: number
  title: string
  text: string
  image: JourneyImage | null
  /** Site path or full address for "Read more", if any. */
  link: string | null
}

export type JourneyInfo = {
  /** The club's story in up to three short chapters. */
  chapters: readonly Chapter[]
  /** Oldest first. */
  milestones: readonly Milestone[]
}
