export type SectionHeadingProps = {
  id: string
  /** Small label above the heading, e.g. "Membership". */
  eyebrow: string
  heading: string
  intro?: string
}

/** Centred section heading with a small eyebrow label above it and an optional intro below. */
export function SectionHeading({ id, eyebrow, heading, intro }: SectionHeadingProps) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <p className="text-sm font-semibold tracking-wide text-brand-primary uppercase">{eyebrow}</p>
      <h2 id={id} className="mt-2 text-3xl font-bold tracking-tight text-balance sm:text-4xl">
        {heading}
      </h2>
      {intro && <p className="mt-3 text-lg text-text-muted">{intro}</p>}
    </div>
  )
}
